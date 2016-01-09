__author__ = 'katharina hafner'
# 27/12/15:         crawling website moviebarcodes.tumblr.com/movie-index;
#                   building/ testing RE
# 03/01/-04/01/16:  introduction mongodb; storing simple data in Collection
#                   'movie'; establish connection to original image files;
#                   storing image files in gridfs bucket with post_id as ref-key


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
    # print(str_response)

    #outputfile = open("C:/Users/katharina/PycharmProjects/Moviebarcodes/output.txt", "w")
    outputfile = open("/Applications/XAMPP/xamppfiles/htdocs/dh_mb_lbkjv/output.txt", "w")
    outputfile.write(str_response)
    outputfile.close()

    # weiterverarbeiten des inputstrings
    process_file(str_response)
    return str_response


def process_file(file):
    # all ness. pattern
    pattern1 = re.compile('<a href=')   # Searchpattern vor SPLIT-Command
    pattern2 = re.compile('"/post/\d{10,12}/">.* (\(\d{4}\)|\(\d{4}-\d{4}\))')
    p_post_id = re.compile('\d{10,12}')
    p_year = re.compile('(\(\d{4}\)|\(\d{4}-\d{4}\))')
    p_title = re.compile('>.* \(')
    p_image = re.compile('data-src=".*\.(jpg|gif)"')

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

            # get IMDb data
            titleSplit = []
            if ' / ' in l_title:
                titleSplit = l_title.split(' / ')
            if ' - ' in l_title: 
                titleSplit = l_title.split(' - ')
            if ': ' in l_title: 
                titleSplit = l_title.split(': ')
                    
            print(titleSplit)
            if len(titleSplit) > 1:
                obj = get_movie_json(titleSplit[1])
                if 'Error' in obj:
                    obj = get_movie_json(titleSplit[0])
            else: 
                obj = get_movie_json(l_title)
            
            print(obj)
            print(l_title)

            if 'Error' not in obj:
                l_actors = obj['Actors']
                l_country = obj['Country']
                l_director = obj['Director']
                l_writer = obj['Writer']
                l_genre = obj['Genre']
                l_language = obj['Language']
                l_released = obj['Released']
                l_runtime = obj['Runtime']
                l_plot = obj['Plot']
            else:
                l_actors = ""
                l_country = ""
                l_director = ""
                l_writer = ""
                l_genre = ""
                l_language = ""
                l_released = ""
                l_runtime = ""
                l_plot = ""


            #print("MATCH:", line)
            print(" __Id:", l_post_id, "| __Film:", l_title, "| __Jahr:", l_year)

            # fetch jpg from original url
            l_urlpic = 'http://moviebarcode.tumblr.com/image/' + l_post_id
            l_image_exif = urllib.request.urlopen(l_urlpic)
            str_image = l_image_exif.read().decode('utf-8')

            # extract with RE original image URL
            l_image = ((re.search(p_image, str_image)).group(0))[10:-1]
            f = requests.get(l_image)

            #print(" __URL:", l_urlpic, "| __ORIGIN:", l_image, "\n")
            print(l_title, l_year, l_image, l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, l_runtime, l_plot)
           
            # fill mongodb
            fill_collection(db, fs, l_post_id, l_title, l_year, l_image, l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, l_runtime, l_plot)


def get_movie_json(title):
    urlTitle = urllib.parse.quote_plus(title.replace('The Complete ', ''))
    print("http://www.omdbapi.com/?t=" + urlTitle)
    response = urlopen("http://www.omdbapi.com/?t=" + urlTitle).read().decode('utf8')
    obj = json.loads(response)
    return obj


def fill_collection(db, fs, l_post_id, l_title, l_year, l_image, l_actors, l_country, l_director, l_writer, l_genre, l_language, l_released, l_runtime, l_plot):
    if not fs.exists({"_id": l_post_id}):
        fs.put(urllib.request.urlopen(l_image), _id=l_post_id, filename=l_image)

    if db.movie.find_one({"_id": l_post_id}):
        print(l_post_id, "bereits vorhanden")
        db.movie.update(
            {"_id": l_post_id},
            {
                '$set': {"moviebarcode": "abc"}
            },
            upsert=False
        )

    else:
        db.movie.insert_one(
            {
                "_id": l_post_id,
                "title": l_title,
                "year": l_year,
                "director": l_director,
                "writer": l_writer,
                "actors": l_actors, 
                "stars": "",
                "storyline":
                    {
                        "summary": l_plot,
                        "plotkeywords": "",
                        "taglines": "",
                        "genre": l_genre,
                        "certificate": ""
                    },
                "details":
                    {
                        "country": l_country,
                        "language": l_language,
                        "releasedate": l_released,
                        "fimlinglocations": ""
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


def main():
    link = "http://moviebarcode.tumblr.com/movie-index"
    get_content(link)

if __name__ == '__main__':
    main()
