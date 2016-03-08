<?php
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
    }
?>
