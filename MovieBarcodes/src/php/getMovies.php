<?php
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
        default: 
            return; 
    }

    function getAllMovies($parameters, $sort, $init) {
        global $myCollection, $gridFS; 
        $p = array(); 
        if($parameters == "") {
            //->sort(array("title" => -1)); 
            $results = $myCollection->find();
        } else {
            for($i = 0; $i < count($parameters); $i++) {
                $parameter = $parameters[$i]; 
                $key = $parameter['key']; 
                $value = $parameter['value']; 
                ChromePhp::log($key);
                ChromePhp::log($value);
                if(isset($value['gte']) && isset($value['lte'])) {
                    $value = array('$gte' => (int) $value['gte'], '$lte' => (int) $value['lte']);
                } else if($value[0] == "/") {
                    $value = new MongoRegex($value);
                }
                $p[$key] = $value; 
            }
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


        $moviebarcodeData =  base64_encode($gridFS->findOne(array("_id" => $id))->getBytes());
        $image = "data:image/jpeg;base64, $moviebarcodeData";
        $movieData = array("title"=>$title, "image"=>$image, "actors"=>$actors, "country"=>$country, "director"=>$director, "genre"=>$genre, "language"=>$language, "year"=>$year, "runtime"=>$runtime, "summary"=>$summary, "dominantColors"=>$dominantColors); 
        echo json_encode($movieData);
    }
?>
