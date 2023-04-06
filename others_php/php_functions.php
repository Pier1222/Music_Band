<?php

//FALSE pour ne pas afficher les warnings PHP pour l'utiliser et TRUE pour montrer ces erreurs dans le cadre de débogage
$show_PHP_warnings = false;

//Certificat qui permet de faire fonctionner les requêtes cURL
$certificate = "C:\wamp64\cacert.pem";

function getArrayDeezer($request, $certificate, $debug_echo, $show_PHP_errors) {
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $request,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",


        /* Solution pour éviter "cURL Error #:SSL certificate problem:
        unable to get local issuer certificate", même si la solution
        préconisée est de référencer le certificat dans curl.cainfo et
        openssl.cafile dans PHP.ini mais cela ne fonctionne pas pour moi
        */
        CURLOPT_CAINFO => $certificate,
        CURLOPT_CAPATH => $certificate,

        //Autre solution mais mauvaise niveau sécurité
        /*
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
        */

        /*
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Authorization: Bearer token',
            'Content-Type: application/json'
        ],
        */
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        if($show_PHP_errors) {
            echo "cURL Error '" . $request . "':" . $err;
        }
        return NULL;
    } else {
        //echo $response;

        if($debug_echo) {
            echo($request . ":");
            var_dump(json_decode($response));
            echo "\n\n";
        }
        

        //Récupère la réponse sous forme de tableau
        $array_response = json_decode($response, true);

        return $array_response;
    }
}

function getTimeMinutes($timeSeconds) {
    $nbMinuts  = intdiv($timeSeconds, 60);
    $nbSeconds = $timeSeconds%60;

    return str_pad($nbMinuts, 2, "0", STR_PAD_LEFT).":".str_pad($nbSeconds, 2, "0", STR_PAD_LEFT);
}
?>