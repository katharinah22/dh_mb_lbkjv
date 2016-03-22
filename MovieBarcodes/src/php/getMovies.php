<?php
    ini_set('default_charset', 'UTF-8');
    include_once 'ChromePhp.php';

    // Connect to localhost on the default port.
    $mongoDB = new Mongo();
    
    // Get a handle on the myCollection collection,
    // which is in the 'test' database.
    $myCollection = $mongoDB->db_moviebarcodes->movie;
    $gridFS = $mongoDB->db_moviebarcodes->getGridFS();


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
            $parameters = $_GET['parameters']; 
            $sort = $_GET['sort']; 
            getMoviesForListView($parameters, $sort); 
            break;
        default: 
            return; 
    }

    function getResults($parameters, $sort) {
        global $myCollection, $gridFS; 
        $p = array(); 
        if($parameters == "") {
            $results = $myCollection->find();
        } else {
            for($i = 0; $i < count($parameters); $i++) {
                $parameter = $parameters[$i]; 
                $key = $parameter['key']; 
                if ($key == "subtitles") {
                    $key = "subtitlesLemmatisation";
                }
                $value = $parameter['value']; 
                ChromePhp::log($value); 
                if(isset($value['gte']) && isset($value['lte'])) {
                    $value = array('$gte' => (int) $value['gte'], '$lte' => (int) $value['lte']);
                } else if($key == "color") {
                    $key = "dominantColors." . $value['name'];
                    $value = array('$gte' => (int) $value['gte']);
                } else if ($value[0] == "/") {
                    $value = new MongoRegex($value);
                }   
                $p[$key] = $value;
            }
            
            ChromePhp::log($p); 
            $results = $myCollection->find($p);          
        }
        $results->sort(array($sort["value"] => (int) $sort["sortDirection"])); 
        return $results;

        /*global $myCollection, $gridFS; 
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
        return $results;*/
    }

    function getAllMovies($parameters, $sort, $init) {
        global $myCollection, $gridFS; 
        $results = getResults($parameters, $sort);

        $movies = array(); 
        $genres = array(); 
        $result = array(); 
        $domColPercentageCount = array(); 
        $overallMostFrequentWords = array();

        $resultsLength = $results->count(); 
        $genres["all"] = $resultsLength; 
        foreach ($results as $movie) {

            $title = $movie['title'];
            $year = $movie['year'];
            $id = $movie['_id']; 
            $dominantColors = $movie['dominantColors']; 
            asort($dominantColors);
            $dominantColors = array_slice(array_reverse($dominantColors), 0, 3);
            $dominantColorKeys = array_keys($dominantColors);
            $firstColor = $dominantColorKeys[0]; 
            $secondColor = $dominantColorKeys[1]; 
            $thirdColor = $dominantColorKeys[2]; 
            if(isset($movie['subtitlesMostFrequentWords'])) {
                $subtitlesMostFrequentWords = $movie['subtitlesMostFrequentWords'];
            } else {
                $subtitlesMostFrequentWords = "";
            }
            $overallMostFrequentWords = addSubtitleToOverallMostFrequentWords($overallMostFrequentWords, $subtitlesMostFrequentWords);
            //ChromePhp::log($overallMostFrequentWords);
            $domColPercentageCount = addColorPercentagesToFrequency($domColPercentageCount, $movie['dominantColors']);

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
        $overallMostFrequentWords = getTopMostFrequentWords($overallMostFrequentWords);
        //ChromePhp::log($overallMostFrequentWords);
        $domColPercentageCount = frequencyToPercentage($domColPercentageCount, $resultsLength);
        //ChromePhp::log($domColPercentageCount);
        if($init) {
            $result = array("movies"=>$movies, "genres"=>$genres, "domColPercentageCount"=>$domColPercentageCount, "overallMostFrequentWords"=>$overallMostFrequentWords); 
        } else {
            $result = array("movies"=>$movies, "domColPercentageCount"=>$domColPercentageCount, "overallMostFrequentWords"=>$overallMostFrequentWords); 
        }
        echo json_encode($result);
    }

    function addSubtitleToOverallMostFrequentWords($overallMostFrequentWords, $subtitlesMostFrequentWords) {
        $mostFrequentWordsOfThisMovie = split(", ", $subtitlesMostFrequentWords);
        for ($i = 0; $i < count($mostFrequentWordsOfThisMovie); $i++) {
            $mostFrequentWord = split(" ", $mostFrequentWordsOfThisMovie[$i]);
            if(count($mostFrequentWord) > 1) {
                $mostFrequentWordName = $mostFrequentWord[0];
                $mostFrequentWordCount = str_replace(")", "", $mostFrequentWord[1]);
                $mostFrequentWordCount = (int) str_replace("(", "", $mostFrequentWordCount);
                $currentMostFrequentWordCount = (array_key_exists ($mostFrequentWordName, $overallMostFrequentWords)) ? $overallMostFrequentWords[$mostFrequentWordName] : 0;
                $overallMostFrequentWords[$mostFrequentWordName] = ($currentMostFrequentWordCount + $mostFrequentWordCount);
            }
        }
        return $overallMostFrequentWords; 
    }

    function getTopMostFrequentWords($overallMostFrequentWords) {
        asort($overallMostFrequentWords);
        $overallMostFrequentWords = array_slice(array_reverse($overallMostFrequentWords), 0, 20);
        return $overallMostFrequentWords;
    }

    function addColorPercentagesToFrequency($frequencyArray, $dominantColors) {
        foreach ($dominantColors as $key => $value) {
            $domColName = $key;
            $domColPercentage = $value;
            $currentPercentage = (array_key_exists ($domColName, $frequencyArray)) ? $frequencyArray[$domColName] : 0;
            $frequencyArray[$domColName] = ($currentPercentage + $domColPercentage);
        }
        return $frequencyArray;
    }           
            
    function frequencyToPercentage($frequencyArray, $length) {
        foreach ($frequencyArray as $key => $value) {
            $frequencyArray[$key] = round($value/$length);
        }
        asort($frequencyArray);
        $frequencyArray = array_reverse($frequencyArray);
        ChromePhp::log($frequencyArray);
        return $frequencyArray; 
    }

    function getMoviesForListView($parameters, $sort) {
        global $myCollection, $gridFS;
        $movies = array(); 
        $result = array(); 
        $domColPercentageCount = array(); 
        $overallMostFrequentWords = array(); 
        $results = getResults($parameters, $sort);
        $resultsLength = $results->count(); 
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
            asort($dominantColors);
            $dominantColors = array_slice(array_reverse($dominantColors), 0, 3);
            $topDomColors = getTopDominantColors($dominantColors); 

            if(isset($movie['subtitlesMostFrequentWords'])) {
                $subtitlesMostFrequentWords = $movie['subtitlesMostFrequentWords'];
            } else {
                $subtitlesMostFrequentWords = "";
            }
            $overallMostFrequentWords = addSubtitleToOverallMostFrequentWords($overallMostFrequentWords, $subtitlesMostFrequentWords);
            $domColPercentageCount = addColorPercentagesToFrequency($domColPercentageCount, $dominantColors);

            $movies[] = array("id"=>$id, "title"=>$title, "year"=>$year, "director"=>$director, "genre"=>$genre, "country"=>$country, "dominantColors"=>$topDomColors); 
            
        }
        
        $overallMostFrequentWords = getTopMostFrequentWords($overallMostFrequentWords);
        $domColPercentageCount = frequencyToPercentage($domColPercentageCount, $resultsLength);
        ChromePhp::log($overallMostFrequentWords);
        $result = array("movies"=>$movies, "domColPercentageCount"=>$domColPercentageCount, "overallMostFrequentWords"=>$overallMostFrequentWords);
        echo json_encode($result);
    }

    function getTopDominantColors($dominantColors) {
        $topDomColors = array();
        $i = 0;
        foreach ($dominantColors as $key => $value) {
            $topDomColor["color"] = $key;
            $topDomColor["percent"] = $value;
            $topDomColors[$i] = $topDomColor; 
            $i++;
        }
        return $topDomColors;
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
        asort($dominantColors);
        $dominantColors = array_reverse($dominantColors);
        $topDomColors = getTopDominantColors($dominantColors); 

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
        $movieData = array("title"=>$title, "image"=>$image, "actors"=>$actors, "country"=>$country, "director"=>$director, "genre"=>$genre, "language"=>$language, "year"=>$year, "runtime"=>$runtime, "summary"=>$summary, "dominantColors"=>$topDomColors, "subtitlesMostFrequentWords"=>$subtitlesMostFrequentWords); 
        echo json_encode($movieData);
    }
?>
