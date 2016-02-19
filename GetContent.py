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
# 19,20,21/01/16    html-code of our source-website moviebarcodes.tumblr.com
#                   changed -> fitting code
# 23/01/16          get dominant colors with ColorThief from each imagefile
#                   store in collections
# 27/01/16          fetching posters from omdb, storing at grid fs; changes
#                   color thief
# 29/01/16          color clustering data into mongodb
# 02/02/16          restrict hits by removing Titles with "...[Sequence from]"
# 19/02/16          get subtitles from OpenSubtitles.org

import urllib.parse
from urllib import parse
import urllib.request
from urllib.request import urlopen
import urllib.error
import urllib.response
import requests
import re                                                       # Regular Expressions
from pymongo import MongoClient                                 # NoSQL DB Framework
import gridfs                                                   # Mongo DB Grid FS Bucket
import json
import colorthief as ct                                         # get dominant colors from image
import webcolors                                                # conversation rgb to hex
from Naked.toolshed.shell import execute_js, muterun_js
import argparse
import numpy as np
import cv2
import struct,os                                                # get subtitles from OpenSubtitles
import io, gzip                                                 # get subtitles from OpenSubtitles, unzip subtitles
import base64                                                   # get subtitles from OpenSubtitles, decode base64
from sklearn.cluster import KMeans
from xmlrpc.client import ServerProxy, Error
# import matplotlib.pyplot as plt

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
    p_seqfr = re.compile('\[Sequence from\]')
    p_post_id = re.compile('\d{10,12}')
    p_year = re.compile('(\(\d{4}\)|\(\d{4}-\d{4}\))')
    p_title = re.compile('>.* \(')
    p_image = re.compile('data-src=".*\.(jpg|gif)"')
    # p_imdb_imgid = re.compile('<a href="http://www\.imdb\.com/title/tt\d{6,10}/">') "before changes on Website
    myString = "redirect\?z=http%3A%2F%2Fwww\.imdb\.com%2Ftitle%2Ftt\d{6,10}"
    p_imdb_imgid = re.compile('www\.imdb\.com%2Ftitle%2Ftt\d{6,10}')
    # p_imdb_imgid = re.compile('www\.imdb\.com/title/tt\d{6,10}/">')

    # Creates connection
    client = MongoClient()
    # creates database (client is connected to a server which accepts writes)
    db = client.db_moviebarcodes
    # creates GridFS Bucket instance for storing image files
    fs = gridfs.GridFS(db)

    # write_color_clusters_to_db(db)

    # split inputstream at pattern1 (<a href=)
    # search for matches (pattern2: imageid, title, year) in splitted lines
    parts = re.split(pattern1, file)
    for line in parts:
        # check if pattern matches
        if re.search(p_seqfr, line):
            debugKH("No hit: " + line)     # go over titles "...[SEQUENCE FROM]"
        elif re.search(pattern2, line):
            # search in matched-line for valid db-values
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
            l_awards = ""
            l_metascore = ""
            l_imdb_votes = ""
            l_type = ""
            l_rated = ""
            l_poster = ""   # url for poster

            # search for match in stringresult
            if imdb_flag == 0 and re.search(p_imdb_imgid, str_imdb_imgid):
                # pattern matched
                # l_imdbid = (re.search(p_imdb_imgid, str_imdb_imgid).group(0)[35:-3])  "" changes Website
                l_imdbid = (re.search(p_imdb_imgid, str_imdb_imgid).group(0)[23:])
                # if imdb-id exists at moviebarcodes.tumblr.com/post/xxxxxxx  -> Search by ttxxxxxx at OMDbAPI
                # no hit: search by title at omdb-api
                obj = get_movie_json_by_id(l_imdbid)
                if 'Error' in obj:
                    imdb_flag = 1
                else:
                    l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, \
                    l_runtime, l_plot, l_imdb_rating, l_awards, l_metascore, l_imdb_votes, \
                    l_type, l_rated, l_poster = objdata_to_db(obj)
            else:
                l_imdbid = "No IMDb-Id!"
                imdb_flag = 1

            debugKH(l_imdbid)
            # Search Metadata by Titel
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

                if 'Error' not in obj:
                    l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, \
                    l_runtime, l_plot, l_imdb_rating, l_awards, l_metascore, l_imdb_votes, \
                    l_type, l_rated, l_poster = objdata_to_db(obj)

                print(l_title, l_year, l_image, l_actors, l_country, l_director, l_writer, l_genre,
                      l_language, l_released, l_runtime, l_plot, l_imdb_rating, l_awards, l_metascore,
                      l_imdb_votes, l_type, l_rated, l_poster)
#            '''
            # fill mongodb
            fill_collection(db, fs, l_post_id, l_imdbid, l_title, l_year, l_image, l_actors, l_country,
                            l_director, l_writer, l_genre, l_language, l_released, l_runtime, l_plot,
                            l_imdb_rating, l_awards, l_metascore, l_imdb_votes, l_type, l_rated, l_poster)
#            '''
            # get dominant colors of each moviebarcode-image
            # get_dominant_color_by_colorthief(db, fs, l_post_id)   # unused
            get_dominant_colors_by_colordiff(db, fs, l_post_id) 
            get_subtitles(db, l_post_id, l_imdbid)
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
    l_awards = obj['Awards']
    l_metascore = obj['Metascore']
    l_imdb_votes = obj['imdbVotes']
    l_type = obj['Type']
    l_rated = obj['Rated']
    l_poster = obj['Poster']
    return l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released,\
           l_runtime, l_plot, l_imdb_rating, l_awards, l_metascore, l_imdb_votes, \
           l_type, l_rated, l_poster


def fill_collection(db, fs, l_post_id, l_imdbid, l_title, l_year, l_image, l_actors,
                    l_country, l_director, l_writer, l_genre, l_language, l_released,
                    l_runtime, l_plot, l_imdb_rating, l_awards, l_metascore,
                    l_imdb_votes, l_type, l_rated, l_poster):
    try:
        # save JPG or GIF of MovieBarcodes in GridFS
        if not fs.exists({"_id": l_post_id}):
            fs.put(urllib.request.urlopen(l_image), _id=l_post_id, filename=l_image)

        # save movieposter in db
        l_posterid = "P" + l_post_id
        if l_poster == "":
            debugKH("No poster!")
        elif l_poster == "N/A":
            debugKH(l_poster)
        else:
            if not fs.exists({"_id": l_posterid}):
                fs.put(urllib.request.urlopen(l_poster), _id=l_posterid, filename=l_poster)
            else:
                print("available yet (" + l_poster + ")")

        # if l_title contains "The Complete ..."
        # save series of movies (e.g. James Bond) in separate collection
        p_serie = re.compile('The Complete.*')
        if re.search(p_serie, l_title):
            if db.serie.find_one({"_id": l_post_id}):
                debugKH(l_post_id + "already in db")
            else:
                # it's a serie of movies
                debugKH("SERIE:" + l_title)
                db.serie.insert_one(
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
                                "type": l_type,
                                "genre": l_genre,
                                "runtime": l_runtime,
                                "imdbrating": l_imdb_rating,
                                "imdbvotes": l_imdb_votes
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
                                "awards": l_awards,
                                "metascore": l_metascore,
                                "rated": l_rated
                            }
                    }
                )
        else:

            if db.movie.find_one({"_id": l_post_id}):
                debugKH(l_post_id + "already in db")
            else:
                db.movie.insert_one(
                    {
                        "_id": l_post_id,
                        "imdb_id": l_imdbid,
                        "title": l_title,
                        "year": int(l_year),
                        "director": l_director,
                        "writer": l_writer,
                        "actors": l_actors,
                        "storyline":
                            {
                                "summary": l_plot,
                                "type": l_type,
                                "genre": l_genre,
                                "runtime": l_runtime,
                                "imdbrating": l_imdb_rating,
                                "imdbvotes": l_imdb_votes
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
                                "awards": l_awards,
                                "metascore": l_metascore,
                                "rated": l_rated
                            }
                    }
                )
    except Exception as e:
        print('******************************Exception beim fillcollection()', e)


def centroid_histogram(clt):
    # grab the number of different clusters and create a histogram
    # based on the number of pixels assigned to each cluster
    numLabels = np.arange(0, len(np.unique(clt.labels_)) + 1)
    (hist, _) = np.histogram(clt.labels_, bins=numLabels)

    # normalize the histogram, such that it sums to one
    hist = hist.astype("float")
    hist /= hist.sum()

    # return the histogram
    return hist


def get_dominant_colors_by_colordiff(db, fs, l_post_id):
    img_barcode = fs.get(l_post_id).read()
    my_img = open("myMovieBarcode.jpg", "wb")
    my_img.write(img_barcode)
    my_img.close()

    image = cv2.imread("myMovieBarcode.jpg")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.reshape((image.shape[0] * image.shape[1], 3))
    clt = KMeans(n_clusters=3)
    clt.fit(image)
    hist = centroid_histogram(clt)
    count = 1
    dominant_colors = {}
    for (percent, color) in zip(hist, clt.cluster_centers_):
        print(percent)
        color_R = color[0]
        color_G = color[1]
        color_B = color[2]
        #real_color = "{ R: " + str(color_R) + ", G: " + str(color_G) + ", B: " + str(color_B) + " }"
        real_color = "rgb(" + str(color_R) + ", " + str(color_G) + ", " + str(color_B) + ")"
        print(real_color) 
        # response = muterun_js('colorDiffTest.js ' + str(color_R) + ' ' + str(color_G) + ' ' + str(color_B))
        response = muterun_js('color-diff.js ' + str(color_R) + ' ' + str(color_G) + ' ' + str(color_B))
        clustered_color = response.stdout.rstrip().decode('ascii')
        print(clustered_color)
        dominant_colors[str(count)] = {
            "realcolor": real_color,
            "percent": percent, 
            "clusteredcolor": clustered_color
        }
        count += 1
    print(dominant_colors)
    # return dominant_colors
    store_colors_by_colordiff_to_db(db, l_post_id, dominant_colors)


def store_colors_by_colordiff_to_db(db, l_post_id, dominant_colors):
    print(dominant_colors)
    if db.movie.find_one({"_id": l_post_id}):
        debugKH("UPDATE" + l_post_id)
        try:
            db.movie.update(
                {"_id": l_post_id},
                {
                    '$set': {
                        "dominantColors": dominant_colors
                    }
                },
                upsert=False
            )
        except Exception as e:
            print(e)
    elif db.serie.find_one({"_id": l_post_id}):
        debugKH("UPDATE" + l_post_id)
        try:
            db.serie.update(
                {"_id": l_post_id},
                {
                    '$set': {
                        "dominantColors": dominant_colors
                    }
                },
                upsert=False
            )
        except Exception as e:
            print(e)
    else:
        print("no entry for ", l_post_id)


# unused
def get_dominant_color_by_colorthief(db, fs, l_post_id):
    img_barcode = fs.get(l_post_id).read()
    my_img = open("myMovieBarcode.jpg", "wb")
    my_img.write(img_barcode)
    my_img.close()

    cot = ct.ColorThief("myMovieBarcode.jpg")

    # get dominat color
    dominat_color = cot.get_color(quality=1)
    dominat_color = webcolors.rgb_to_hex(dominat_color) # rgb to hex
    # palette of colors
    arr_domcol = cot.get_palette(color_count=10)

    debugKH("DominantColor 1: " + dominat_color)

    i = 0
    arr_domcol_hex = []
    for i in range(0, len(arr_domcol)):
        arr_domcol_hex.append(webcolors.rgb_to_hex(arr_domcol[i]))
        print("PaletteColor: ", i+2, " ", webcolors.rgb_to_hex(arr_domcol[i]))
        i += 1
    debugKH(arr_domcol_hex)
    store_domcol_to_db(db, l_post_id, dominat_color, arr_domcol_hex)


def store_domcol_to_db(db, l_post_id, dominat_color, arr_domcol_hex):
    if db.movie.find_one({"_id": l_post_id}):
        debugKH("UPDATE" + l_post_id)
        try:
            db.movie.update(
                {"_id": l_post_id},
                {
                    '$set': {"dominantColors":
                                {
                                    "1st": dominat_color,
                                    "2nd": arr_domcol_hex[0],
                                    "3rd": arr_domcol_hex[1],
                                    "4th": arr_domcol_hex[2],
                                    "5th": arr_domcol_hex[3],
                                    "6th": arr_domcol_hex[4],
                                    "7th": arr_domcol_hex[5],
                                    "8th": arr_domcol_hex[6],
                                    "9th": arr_domcol_hex[7],
                                    "10th": arr_domcol_hex[8]
                                }
                    }
                },
                upsert=False
            )
        except Exception as e:
            print(e)
    elif db.serie.find_one({"_id": l_post_id}):
        debugKH("UPDATE" + l_post_id)
        try:
            db.serie.update(
                {"_id": l_post_id},
                {
                    '$set': {"dominantColors":
                                {
                                    "1st": dominat_color,
                                    "2nd": arr_domcol_hex[0],
                                    "3rd": arr_domcol_hex[1],
                                    "4th": arr_domcol_hex[2],
                                    "5th": arr_domcol_hex[3],
                                    "6th": arr_domcol_hex[4],
                                    "7th": arr_domcol_hex[5],
                                    "8th": arr_domcol_hex[6],
                                    "9th": arr_domcol_hex[7],
                                    "10th": arr_domcol_hex[8]
                                }
                    }
                },
                upsert=False
            )
        except Exception as e:
            print(e)
    else:
        print("no entry for ", l_post_id)


def store_subtitles_to_db(db, l_post_id, subtitle):
        print("Subtitle", subtitle)
        if db.movie.find_one({"_id": l_post_id}):
            debugKH("UPDATE" + l_post_id)
            try:
                db.movie.update(
                    {"_id": l_post_id},
                    {
                        '$set': {"subtitle":
                                    subtitle
                        }
                    },
                    upsert=False
                )
            except Exception as e:
                print(e)
        elif db.serie.find_one({"_id": l_post_id}):
            debugKH("UPDATE" + l_post_id)
            try:
                db.serie.update(
                    {"_id": l_post_id},
                    {
                        '$set': {"subtitle":
                                    subtitle
                        }
                    },
                    upsert=False
                )
            except Exception as e:
                print(e)
        else:
            print("no entry for ", l_post_id)


def get_subtitles (db, l_post_id, l_imdbid):
    try:
        server = ServerProxy('http://api.opensubtitles.org/xml-rpc')
        # to Do: Register a UserAgent for this project and insert registration data
        token = server.LogIn('', '', 'en', 'OSTestUserAgent')['token']
        imdb_id=int(l_imdbid[2:])
        search_request = []
        search_request.append({'imdbid':imdb_id, 'sublanguageid':'en'})
        resp = server.SearchSubtitles(token, search_request)
        subtitle_id = []
        subtitle_id.append(resp['data'][0]['IDSubtitle'])
        subtitle_data = server.DownloadSubtitles(token, subtitle_id)
        if subtitle_data['status'] == '200 OK':
            compressed_data = subtitle_data['data'][0]['data']
            decoded_subtitle = base64.b64decode(compressed_data)
            decoded_subtitle = gzip.GzipFile(fileobj=io.BytesIO(decoded_subtitle)).read()
            store_subtitles_to_db(db, l_post_id, decoded_subtitle)
    except(ValueError):
        print("No subtitle available")


# unused
def write_color_clusters_to_db(db):
    l_cc = open("satfaces.txt")
    f = l_cc.read()

    p_linebreak = re.compile('\n')
    pattern1 = re.compile('\[\d{1,3}, \d{1,3}, \d{1,3}\] .*')
    p_rgb = re.compile('\d{1,3}, \d{1,3}, \d{1,3}')
    p_name = re.compile('\) .*')

    cc_parts = (re.split(p_linebreak, f))
    for cc_line in cc_parts:
        if re.search(pattern1, cc_line):
            cc_line = re.sub('\[', '(', cc_line)
            cc_line = re.sub('\]', ')', cc_line)
            l_match_rgb = ((re.search(p_rgb, cc_line)).group(0))            # rgb for db
            l_match_rgb = re.split(',', l_match_rgb)
            l_match_red = int(l_match_rgb[0])
            l_match_green = int(l_match_rgb[1])
            l_match_blue = int(l_match_rgb[2])

            l_tuple_rgb = l_match_red, l_match_green, l_match_blue
            l_match_hex = webcolors.rgb_to_hex(l_tuple_rgb)                 # hex value for db

            l_match_name = ((re.search(p_name, cc_line)).group(0))[2:]      # color name for db

            if db.colorcluster.find_one({"_id": l_match_hex}):
                debugKH("UPDATE" + l_match_hex)
                try:
                    db.serie.update(
                        {"_id": l_match_hex},
                            {
                                '$set':
                                    {
                                        "rgbval": l_match_rgb,
                                        "colorcluster": l_match_name
                                    }
                            },
                            upsert=False
                    )
                except Exception as e:
                    print(e)

            else:
                db.colorcluster.insert_one(
                    {
                        "_id": l_match_hex,
                        "rgbval": l_match_rgb,
                        "colorcluster": l_match_name
                    }
                )

    l_cc.close()


# commandline output katharina // ONLY TEST!
def debugKH(s):
    print("KH:", s)


def main():
    link = "http://moviebarcode.tumblr.com/movie-index"
    get_content(link)

if __name__ == '__main__':
    main()
