<?php
<<<<<<< HEAD
    // Connect to localhost on the default port.
    $mongoDB = new Mongo();
    
    // Get a handle on the myCollection collection,
    // which is in the 'test' database.
    $myCollection = $mongoDB->db_moviebarcodes->movie;

    // Find everything in our collection:
    $results = $myCollection->find();

    // Loop through all results
    foreach ($results as $document) {

        // Attributes of a document come back in an array.
        $title = $document['title'];

        // Technically, _id is a MongoId object. It can 
        // be automatically converted to a string, though.
        $id = $document['_id'];

        // Print out the values.
        printf("Test Value: %d, ID Value: %s\n", $title, $id);
=======
    ini_set('default_charset', 'UTF-8');
    include_once 'ChromePhp.php';
    // Connect to localhost on the default port.
    $mongoDB = new Mongo();
    
    $myCollection = $mongoDB->db_moviebarcodes->movie;
    $gridFS = $mongoDB->db_moviebarcodes->getGridFS();

    /*$sort = array('value'=> "title", 'sortDirection'=> 1); 
    getAllMovies("", $sort, false); */
    //$parameters = [{"key": "genre", "value": new MongoRegex("/Sport/")}]; 
    //getAllMovies($parameters);
    switch($_GET['command']) {
        case 'getAllMovies':
            $parameters = $_GET['parameters']; 
            $sort = $_GET['sort']; 
            $init = true; 
            ChromePhp::log($sort["value"]);
            ChromePhp::log($sort["sortDirection"]);
            getAllMovies($parameters, $sort, $init); 
            break; 
        case 'getMovieDetailsByID': 
            $id = $_GET['id'];
            getMovieDetailsByID($id);
            break; 
        case 'getMovies':
            $parameters = $_GET['parameters']; 
            $sort = $_GET['sort']; 
            $init = false; 
            getAllMovies($parameters, $sort, $init);
            break; 
        case 'getMoviesForListView':
            getMoviesForListView(); 
            break;
        default: 
            return; 
    }

    function getAllMovies($parameters, $sort, $init) {
        global $myCollection, $gridFS; 
        $p = array(); 
        if($parameters == "") {
            $results = $myCollection->find();
        } else {
            $and = array(); 
            for($i = 0; $i < count($parameters); $i++) {
                $oneParameter = array(); 
                $parameter = $parameters[$i]; 
                $key = $parameter['key']; 
                if ($key == "subtitles") {
                    $key = "subtitlesLemmatisation";
                }
                $value = $parameter['value']; 
                if(isset($value['gte']) && isset($value['lte'])) {
                    $value = array('$gte' => (int) $value['gte'], '$lte' => (int) $value['lte']);
                } else if($key == "color") {
                    $or = array(); 
                    for ($j = 1; $j <= 3; $j++) {
                        $or[] = array("dominantColors." . $j . ".clusteredcolor" => $value['name'], "dominantColors." . $j . ".percent" => 
                                    array('$gte' => (int) $value['gte']));
                    }
                    $oneParameter = array('$or' => $or); 
                } else if ($value[0] == "/") {
                    $value = new MongoRegex($value);
                } 
                if($key != "color") {
                    $oneParameter[$key] = $value; 
                }
                $and[] = $oneParameter; 
                //$p[$key] = $value; 
            }
            $p['$and'] = $and;
            ChromePhp::log($p); 
            $results = $myCollection->find($p);          
        }

        $results->sort(array($sort["value"] => (int) $sort["sortDirection"])); 

        $movies = array(); 
        $genres = array(); 
        $result = array(); 
        //$movies = "";

        $resultsLength = $results->count(); 
        $genres["all"] = $resultsLength; 
        foreach ($results as $movie) {

            $title = $movie['title'];
            $year = $movie['year'];
            $id = $movie['_id']; 
            $dominantColors = $movie['dominantColors']; 
            $firstColor = $dominantColors['1']['realcolor']; 
            $secondColor = $dominantColors['2']['realcolor']; 
            $thirdColor = $dominantColors['3']['realcolor']; 

            $storyline = $movie['storyline'];
            $genre = $storyline['genre'];
            $genresOfThisMovie = split(", ", $genre);
            if($init) {                
                for ($i = 0; $i < count($genresOfThisMovie); $i++) {
                    $currentGenre = $genresOfThisMovie[$i]; 
                    //echo (strcmp($currentGenre, 'N/A') != 0); 
                        if (!array_key_exists($currentGenre, $genres)) {
                            $genres[$currentGenre] = 1; 
                        } else {
                            $genres[$currentGenre] = ($genres[$currentGenre]+1);
                        }
                }
            }
            $posterId = "P" . $id; 
            $posterBinary =  $gridFS->findOne(array("_id" => $posterId)); 
            $posterData = "";
            $img = ""; 
                if (null != $posterBinary) {
                    $posterData = base64_encode($gridFS->findOne(array("_id" => $posterId))->getBytes());
                    $img = "data:image/jpeg;base64, $posterData"; //"<img src='data:image/jpeg;base64, $posterData' />";
                }
            //$movies = $movies.'<div class="resultItem" id="'.$id.'"><div class="resultImgContainer"><img src="'.$img.'" /><div class="resultColorItems"><div class="resultColorItem" id="resultColorItem1" style="background-color:'.$firstColor.';"></div><div class="resultColorItem" id="resultColorItem2" style="background-color:'.$secondColor.';"></div><div class="resultColorItem" id="resultColorItem3" style="background-color:'.$thirdColor.';"></div></div></div><div class="resultTitle">'.$title.'</div></div>';
            
            $movies[] = array("id"=>$id, "title"=>$title, "year"=>$year, "genre"=>$genresOfThisMovie, "poster"=>$img, "firstColor"=>$firstColor, "secondColor"=>$secondColor, "thirdColor"=>$thirdColor); 
        }
        if($init) {
            $result = array("movies"=>$movies, "genres"=>$genres); 
        } else {
            $result = $movies; 
        }
        echo json_encode($result);
    }

    function getMoviesForListView() {
        global $myCollection, $gridFS;
        $movies = array(); 
        $results = $myCollection->find();
        foreach ($results as $movie) {
            $id = $movie['_id']; 
            $title = $movie['title'];
            $year = $movie['year'];
            $director = $movie['director'];
            $storyline = $movie['storyline']; 
            $genre = $storyline['genre'];
            $details = $movie['details']; 
            $country = $details['country']; 
            $dominantColors = $movie['dominantColors'];

            $movies[] = array("id"=>$id, "title"=>$title, "year"=>$year, "director"=>$director, "genre"=>$genre, "country"=>$country, "dominantColors"=>$dominantColors); 
            
        }
        echo json_encode($movies);
    }

    function getMovieDetailsByID($id) {
        global $myCollection, $gridFS;
        $movieData = array(); 

        $movie = $myCollection->findOne(array('_id' => $id));
        $title = $movie['title'];
        $actors = $movie['actors']; 
        $writer = $movie['writer']; 
        $storyline = $movie['storyline']; 
        $genre = $storyline['genre'];
        $summary = $storyline['summary']; 
        $details = $movie['details']; 
        $dominantColors = $movie['dominantColors'];
        $country = $details['country']; 
        $language = $details['language']; 
        $year = $movie['year']; 
        $director = $movie['director'];
        $runtime = $storyline['runtime'];
        $summary = $storyline['summary'];
        if(isset($movie['subtitlesMostFrequentWords'])) {
            $subtitlesMostFrequentWords = $movie['subtitlesMostFrequentWords'];
        } else {
            $subtitlesMostFrequentWords = "";
        }
        
        $moviebarcodeData =  base64_encode($gridFS->findOne(array("_id" => $id))->getBytes());
        $image = "data:image/jpeg;base64, $moviebarcodeData";
        $movieData = array("title"=>$title, "image"=>$image, "actors"=>$actors, "country"=>$country, "director"=>$director, "genre"=>$genre, "language"=>$language, "year"=>$year, "runtime"=>$runtime, "summary"=>$summary, "dominantColors"=>$dominantColors, "subtitlesMostFrequentWords"=>$subtitlesMostFrequentWords); 
        echo json_encode($movieData);
>>>>>>> 8fdaddbf758e166d46f2b41dbcd55f71ddf13014
    }
?>
