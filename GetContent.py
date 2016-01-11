__author__ = 'katharina hafner'
# 27/12/15:         crawling website moviebarcodes.tumblr.com/movie-index;
#                   building/ testing RE
# 03/01/-04/01/16:  introduction mongodb; storing simple data in Collection
#                   'movie'; establish connection to original image files;
#                   storing image files in gridfs bucket with post_id as ref-key
# 09/01/16          get metadata from omdb-api by title (laura)
#                   get metadata from omdb-api by id ( scrap tt_id from website
#                   http://moviebarcode.tumble.com/post/xxxxxxxx); if there's no
#                   hit, search film-metadata by title


import urllib.parse
from urllib import parse
import urllib.request
from urllib.request import urlopen
import urllib.error
import urllib.response
import requests
import re                            # Regular Expressions
from pymongo import MongoClient      # NoSQL DB Framework
import gridfs                        # Mongo DB Grid FS Bucket
import json
try:
    from html import unescape  # python 3.4+
except ImportError:
    try:
        from html.parser import HTMLParser  # python 3.x (<3.4)
    except ImportError:
        from HTMLParser import HTMLParser  # python 2.x
    unescape = HTMLParser().unescape


def get_content(link):
    # Crawl Website Moviebarcodes.tumblr.com/movie-index
    response = urllib.request.urlopen(link)
    str_response = unescape(response.read().decode('utf-8'))
    # debugKH(str_response)
    # use inputstring
    process_file(str_response)
    return str_response


def process_file(file):
    # all ness. pattern
    pattern1 = re.compile('<a href=')   # Searchpattern SPLIT-Command
    pattern2 = re.compile('"/post/\d{10,12}/">.* (\(\d{4}\)|\(\d{4}-\d{4}\))')
    p_post_id = re.compile('\d{10,12}')
    p_year = re.compile('(\(\d{4}\)|\(\d{4}-\d{4}\))')
    p_title = re.compile('>.* \(')
    p_image = re.compile('data-src=".*\.(jpg|gif)"')
    p_imdb_imgid = re.compile('<a href="http://www\.imdb\.com/title/tt\d{6,10}/">')
    # p_imdb_imgid = re.compile('www\.imdb\.com/title/tt\d{6,10}/">')

    # Creates connection
    client = MongoClient()
    # creates database (client is connected to a server which accepts writes)
    db = client.db_moviebarcodes
    # creates GridFS Bucket instance for storing image files
    fs = gridfs.GridFS(db)

    # split inputstream at pattern1 (<a href=)
    # search for matches (pattern2: imageid, title, year) in splitted lines
    parts = re.split(pattern1, file)
    for line in parts:
        # check if pattern matches
        if re.search(pattern2, line):
            # search in matched-line for db-values
            l_post_id = (re.search(p_post_id, line)).group(0)
            l_year = ((re.search(p_year, line)).group(0))[1:-1]    # rm 1 char from both sides of the match
            l_title = ((re.search(p_title, line)).group(0))[1:-2]  # rm 1 from left, 2 from right side

            debugKH("MATCH:" + line)
            debugKH(" __Id: " + l_post_id + " | __Film: " + l_title + " | __Jahr: " + l_year)

            # fetch jpg from original url
            l_urlpic = 'http://moviebarcode.tumblr.com/image/' + l_post_id
            l_image_exif = urllib.request.urlopen(l_urlpic)
            str_image = l_image_exif.read().decode('utf-8')

            # extract with RE original image URL
            l_image = ((re.search(p_image, str_image)).group(0))[10:-1]
            f = requests.get(l_image)

            debugKH(" __URL: " + l_urlpic + " | __ORIGIN: " + l_image)

            l_urlforimdb = 'http://moviebarcode.tumblr.com/post/' + l_post_id
            imdb_flag = 0       # =0 :Search by imdb-id at omdb-api
                                # =1 :Search by title at omdb-api
#            try:
#                l_imdb_imgid = urllib.request.urlopen(l_urlforimdb)
#                str_imdb_imgid = l_imdb_imgid.read().decode('utf-8')
#
#            except Exception:
#               imdb_flag = 1
#                pass

            t1 = requests.head(l_urlforimdb)
            bytes = t1.headers['location']
            # debugKH("vor Encode:", bytes)
            l_urlforimdb = urlEncodeNonAscii(bytes)

            try:
                l_imdb_imgid = urllib.request.urlopen(l_urlforimdb)
                try:
                    bstr_imdb_imgid = l_imdb_imgid.read()
                except Exception as e:
                    print('*****************************Exception beim read()', e)
                print(bstr_imdb_imgid)
                try:
                    str_imdb_imgid = bstr_imdb_imgid.decode('utf-8')
                except Exception as e:
                    print('***************************Exception beim decode()', e)
            except Exception as e:
                print('*********************************************Exception', e)
                imdb_flag = 1

            # set default
            l_actors = ""
            l_country = ""
            l_director = ""
            l_writer = ""
            l_genre = ""
            l_language = ""
            l_released = ""
            l_runtime = ""
            l_plot = ""
            l_imdb_rating = ""

            # search for match in stringresult
            if imdb_flag == 0 and re.search(p_imdb_imgid, str_imdb_imgid):
                # pattern matched
                l_imdbid = (re.search(p_imdb_imgid, str_imdb_imgid).group(0)[35:-3])
                # if imdb-id exists at moviebarcodes.tumblr.com/post/xxxxxxx  -> Search by ttxxxxxx at OMDbAPI
                # no hit: search by title at omdb-api
                obj = get_movie_json_by_id(l_imdbid)
                if 'Error' in obj:
                    imdb_flag = 1
                else:
                    l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, \
                    l_runtime, l_plot, l_imdb_rating = objdata_to_db(obj)
            else:
                l_imdbid = "No IMDb-Id!"
                imdb_flag = 1

            debugKH(l_imdbid)

            if imdb_flag == 1:
                # get IMDb data
                titleSplit = []
                if ' / ' in l_title:
                    titleSplit = l_title.split(' / ')
                if ' - ' in l_title:
                    titleSplit = l_title.split(' - ')
                if ': ' in l_title:
                    titleSplit = l_title.split(': ')

                print("titleSplit:", titleSplit)
                if len(titleSplit) > 1:
                    obj = get_movie_json(titleSplit[1])
                    if 'Error' in obj:
                        obj = get_movie_json(titleSplit[0])
                else:
                    obj = get_movie_json(l_title)

                # print(obj)
                # print(l_title)

                if 'Error' not in obj:
                    l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, \
                    l_runtime, l_plot, l_imdb_rating = objdata_to_db(obj)

                print(l_title, l_year, l_image, l_actors, l_country, l_director, l_writer, l_genre,
                      l_language, l_released, l_runtime, l_plot, l_imdb_rating)

            # fill mongodb
            fill_collection(db, fs, l_post_id, l_imdbid, l_title, l_year, l_image, l_actors, l_country,
                            l_director, l_writer, l_genre, l_language, l_released, l_runtime, l_plot,
                            l_imdb_rating)

            print('\n')


def urlEncodeNonAscii(b):
    return re.sub('[\x80-\xFF]', lambda c: '%%%02x' % ord(c.group(0)), b)


def get_movie_json(title):
    urlTitle = urllib.parse.quote_plus(title.replace('The Complete ', ''))
    #print("http://www.omdbapi.com/?t=" + urlTitle)
    response = urlopen("http://www.omdbapi.com/?t=" + urlTitle).read().decode('utf8')
    obj = json.loads(response)
    return obj


def get_movie_json_by_id(imdb_id):
    response = urlopen("http://www.omdbapi.com/?i=" + imdb_id).read().decode('utf8')
    obj = json.loads(response)
    return obj


def objdata_to_db(obj):
    l_actors = obj['Actors']
    l_country = obj['Country']
    l_director = obj['Director']
    l_writer = obj['Writer']
    l_genre = obj['Genre']
    l_language = obj['Language']
    l_released = obj['Released']
    l_runtime = obj['Runtime']
    l_plot = obj['Plot']
    l_imdb_rating = obj['imdbRating']
    return l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, l_runtime, l_plot, l_imdb_rating


def fill_collection(db, fs, l_post_id, l_imdbid, l_title, l_year, l_image, l_actors, l_country, l_director,
                    l_writer, l_genre, l_language, l_released, l_runtime, l_plot, l_imdb_rating):
    try:
        if not fs.exists({"_id": l_post_id}):
            fs.put(urllib.request.urlopen(l_image), _id=l_post_id, filename=l_image)

        if db.movie.find_one({"_id": l_post_id}):
            debugKH(l_post_id + "(bereits vorhanden)")
            ###
            # db.movie.update(
            #    {"_id": l_post_id},
            #    {
            #        '$set': {"moviebarcode": "abc"}
            #    },
            #    upsert=False
            #)
            ###
        else:
            db.movie.insert_one(
                {
                    "_id": l_post_id,
                    "imdb_id": l_imdbid,
                    "title": l_title,
                    "year": l_year,
                    "director": l_director,
                    "writer": l_writer,
                    "actors": l_actors,
                    "storyline":
                        {
                            "summary": l_plot,
                            "taglines": "",
                            "genre": l_genre,
                            "certificate": "",
                            "imdbrating": l_imdb_rating
                        },
                    "details":
                        {
                            "country": l_country,
                            "language": l_language,
                            "releasedate": l_released,
                            "filminglocations": ""
                        },
                    "boxoffice":
                        {
                            "budget": "",
                            "openingweekend": "",
                            "gross": "",
                            "productionco": ""
                        },
                    "technicalspecs":
                        {
                            "runtime": l_runtime,
                            "soundmix": "",
                            "color": "",
                            "aspectratio": ""
                        }
                }
            )
    except Exception as e:
        print('******************************Exception beim fillcollection()', e)


# commandline output katharina // ONLY TEST!
def debugKH(s):
    print("KH:", s)


def main():
    link = "http://moviebarcode.tumblr.com/movie-index"
    get_content(link)

if __name__ == '__main__':
    main()
