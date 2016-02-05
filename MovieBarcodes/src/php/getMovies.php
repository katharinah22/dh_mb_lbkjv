<?php
    ini_set('default_charset', 'UTF-8');
    include_once 'ChromePhp.php';
    // Connect to localhost on the default port.
    $mongoDB = new Mongo();
    
    $myCollection = $mongoDB->db_moviebarcodes->movie;
    $gridFS = $mongoDB->db_moviebarcodes->getGridFS();

    //getAllMovies("", false); 
    //$parameters = [{"key": "genre", "value": new MongoRegex("/Sport/")}]; 
    //getAllMovies($parameters);
    switch($_GET['command']) {
        case 'getAllMovies':
            $parameters = $_GET['parameters']; 
            $init = true; 
            getAllMovies($parameters, $init); 
            break; 
        case 'getMovieDetailsByID': 
            $id = $_GET['id'];
            getMovieDetailsByID($id);
            break; 
        case 'getMovies':
            $parameters = $_GET['parameters']; 
            $init = false; 
            getAllMovies($parameters, $init);
            break; 
        default: 
            return; 
    }


    function getAllMovies($parameters, $init) {
        global $myCollection, $gridFS; 
        $p = array(); 
        if($parameters == "") {
            //find(array('title' => new MongoRegex("/12/")));
            //array('storyline.genre' => new MongoRegex("/Horror/"))
            $results = $myCollection->find();
        } else {
            for($i = 0; $i < count($parameters); $i++) {
                $parameter = $parameters[$i]; 
                $key = $parameter['key']; 
                $value = $parameter['value']; 
                if($value[0] == "/") {
                    $value = new MongoRegex($value);
                }
                $p[$key] = $value; 
            }
            $results = $myCollection->find($p);
            
        }
        $movies = array(); 
        $genres = array(); 
        $result = array(); 

        $resultsLength = $results->count(); 
        $genres["all"] = $resultsLength; 
        foreach ($results as $movie) {

            $title = $movie['title'];
            $id = $movie['_id']; 
            $dominantColors = $movie['dominantColors']; 
            $firstColor = $dominantColors['1st']; 
            $secondColor = $dominantColors['2nd']; 
            $thirdColor = $dominantColors['3rd']; 

            $storyline = $movie['storyline'];
            if($init) {
                $genre = $storyline['genre'];
                $genresOfThisMovie = split(", ", $genre);
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







            /*$data = $gridFS->findOne(array("_id" => $posterId))->getBytes();
$im = imagecreatefromstring($data);
if ($im !== false) {
    header('Content-Type: image/jpg');
    echo $im; 
    imagejpeg($im);
    imagedestroy($im); 
}*/


            
            $posterBinary =  $gridFS->findOne(array("_id" => $posterId)); 
            $posterData = "";
            $img = ""; 
                if (null != $posterBinary) {
                    $posterData = base64_encode($gridFS->findOne(array("_id" => $posterId))->getBytes());
                    $img = "data:image/jpeg;base64, $posterData"; //"<img src='data:image/jpeg;base64, $posterData' />";
                    /*$test = "<img src='data:image/jpeg;base64, $posterData' />";
                    echo $test; */
                }
            //ChromePhp::log($title);
            //ChromePhp::log($id);
        
            $movies[] = array("id"=>$id, "title"=>$title, "poster"=>$img, "firstColor"=>$firstColor, "secondColor"=>$secondColor, "thirdColor"=>$thirdColor); 
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
        $actors = $movie['actors']; 
        $writer = $movie['writer']; 
        $storyline = $movie['storyline']; 
        $genre = $storyline['genre'];
        $summary = $storyline['summary']; 
        $details = $movie['details']; 
        $country = $details['country']; 
        $language = $details['language']; 
        $year = $movie['year']; 
        $director = $movie['director'];
        $runtime = $storyline['runtime'];
        $summary = $storyline['summary'];


        $moviebarcodeData =  base64_encode($gridFS->findOne(array("_id" => $id))->getBytes());
        $image = "data:image/jpeg;base64, $moviebarcodeData";
        $movieData = array("image"=>$image, "actors"=>$actors, "country"=>$country, "director"=>$director, "genre"=>$genre, "language"=>$language, "year"=>$year, "runtime"=>$runtime, "summary"=>$summary); 
        echo json_encode($movieData);
    }
?>
