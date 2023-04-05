<?php

//FALSE pour ne pas afficher les warnings PHP pour l'utiliser et TRUE pour montrer ces erreurs dans le cadre de débogage
$show_PHP_warnings = true;

//Certificat qui permet de faire fonctionner les requêtes cURL
$certificate = "C:\wamp64\cacert.pem";

if($show_PHP_warnings == false) {
    //Désactive les messages de warnings
    error_reporting(E_ERROR);
}

//Nombre de valeurs par recherche
$limits_TOP_10       = 5;
$limit_artist_moment = 1;
$index_artist_moment = 0; // =0 normalement, mais permet de tester l'affichage avec d'autres artistes
$limit_playlists     = 30;
$limit_radio_replays = 4;

//Liste des genres
//Oui, le tableau se trouve à l'intérieur d'un tableau "data qui n'a que ça"
$array_genres = getArrayDeezer("https://api.deezer.com/genre", $certificate, false, $show_PHP_warnings)["data"];
//print_r($array_genres[0]);


//Je sais que Deezer limite déjà le nombre de morceaux à 10 dans ses tops mais on ne sait jamais
$array_top_10_singles = getArrayDeezer("https://api.deezer.com/chart/0/tracks?limit=".$limits_TOP_10, $certificate, false, $show_PHP_warnings)["data"];
//print_r($array_top_10_single[0]);

//Il n'y a pas de durée donnée pour les albums, il faut donc chercher la liste des albums associés pour additionner leurs durées
$array_top_10_albums = getArrayDeezer("https://api.deezer.com/chart/0/albums?limit=".$limits_TOP_10, $certificate, false, $show_PHP_warnings)["data"];
//print_r($array_top_10_album[0]);

$array_duration_top_10_albums = array();
if(is_null($array_top_10_albums) == false) { //Si on a bien récupéré les infos des top 10 albums
    for ($i=0; $i < count($array_top_10_albums); $i++) {
        $request_actu = $array_top_10_albums[$i]["tracklist"];
        $array_tracks_album_actu = getArrayDeezer($request_actu, $certificate, false, $show_PHP_warnings)["data"];

        $duration_seconds_album_actu = 0;

        for ($y=0; $y < count($array_tracks_album_actu); $y++) { 
            $duration_seconds_album_actu += $array_tracks_album_actu[$y]["duration"];
        }

        $duration_minuts_album_actu = getTimeMinutes($duration_seconds_album_actu);
        array_push($array_duration_top_10_albums, $duration_minuts_album_actu);
    }
}

//L'artiste du moment
$artist_moment = getArrayDeezer("https://api.deezer.com/chart/0/artists?index=".$index_artist_moment."limit=".$limit_artist_moment, $certificate, false, $show_PHP_warnings)["data"][0];

//Top des playlists
$array_top_playlists = getArrayDeezer("https://api.deezer.com/chart/0/playlists?limit=".$limit_playlists, $certificate, false, $show_PHP_warnings)["data"];

//Les moments radios préférés
$array_top_radio_replay = getArrayDeezer("https://api.deezer.com/chart/0/podcasts?limit=".$limit_radio_replays, $certificate, false, $show_PHP_warnings)["data"];

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

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=0.86, maximum-scale=5.0, minimum-scale=0.86">
        <link rel="stylesheet" type="text/css" href="index.css"/>
        <script type="text/javascript" charset="UTF-8" src="index.js"/>


        <!-- Slick -->
        <link rel="stylesheet" type="text/css" href="/slick/slick.css"/>
        <link rel="stylesheet" type="text/css" href="/slick/slick-theme.css"/>

        <script src="/slick/slick.min/js"/>



        <!-- Permet de récupérer les polices "Urbanist", "Open Sans" et
        "Roboto" de Google pour les utiliser dans le CSS" -->
        <link href='https://fonts.googleapis.com/css?family=Urbanist' rel='stylesheet'>
        <link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet'>
        <link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>

        <title>Music Band</title>
    </head>

    <div class="container">

        <header>
            <div class="div_navigation_bar">
                <div class="div_navigation_bar_svg">
                    <svg width="100%" height="100%" id="svg_navigation_bar">
                        <rect x="0" y="0" width="100%" height="100%" fill="#3BC8E7"/>
                        <rect x="30%" y="36%" width="40%" height="4%" fill="#FFFFFF"/>
                        <rect x="30%" y="46%" width="40%" height="4%" fill="#FFFFFF"/>
                        <rect x="30%" y="56%" width="28%" height="4%" fill="#FFFFFF"/>
                    </svg>
                </div>
                <!-- Le bouton bleu avec les barres blanches -->
                <div class="site_name_slogan">
                    <img src="images/Logos/Logo_Music_Band_Blue.png" class="img_logo">
                    <div class="div_info_general_name">
                        Music Band
                        <span id="info_general_slogan">La musique au bout des doigts</span>
                    </div>
                </div>

                <!-- Permet d'avoir un espace automatique entre
                la gauche et la droite de la barre -->
                <div class="div_navigation_bar_empty_space">
                </div>

                <form action="#" method="post" class="form_search_music">
                    <input 
                        type="text"
                        class="input_text" 
                        id="search_music_name" 
                        placeholder="Recherchez, écoutez..."
                        required>

                    <input 
                        type="submit"
                        value="" 
                        id="form_search_music_button"/>
                </form>

                <div class="div_navigation_bar_profil">
                    <img src="images/placeholder/Profil_Iron_Man.jpg" id="img_profil">
                    Alain
                </div>
                

            </div>
        </header>

        <body>
            <div class="div_presentation">
                <div class="div_title">
                    <span class="blue_text">Music</span> Band
                    <br>
                </div>
                <p id="presentation_paragraphe">
                    Votre musique sans pub, partout. Seulement 9,99€/mois ensuite. <br>
                    Soumis à conditions. Des podcasts exclusifs. <br>
                    Des playlists sur mesure. faites des découvertes. <br>
                    Zapper à volonté. Plus de 50 M de chansons. <br>
                    Annulation à tout moment. <br>
                </p>
                <div class="div_presentation_buttons">
                    <button onclick="location.href = 'https://vos-competences.com/login'" class="general_button blue_button presentation_buttons"> COMMENCER L'ÉCOUTE </button>
                    <button onclick="location.href = 'https://fr.khanacademy.org/'" class="general_button transparent_button presentation_buttons"> S'ABONNER </button>
                </div>
            </div>


            <!-- Genres -->
            <div class="div_caroussel">
                <div class="div_category_title div_caroussel_title">
                    Genre
                    <br>
                </div>
                <div class="div_caroussel_elements_list">
                    <?php if(is_null($array_genres)) { ?>
                        <div class="div_error_curl">
                            Erreur: Liste des genres non disponible
                        </div>
                    <?php }  else {
                        for ($i=0; $i < count($array_genres); $i++) { ?>
                            <div class="div_caroussel_one_element">
                                <img src=<?php echo($array_genres[$i]["picture_big"]) ?> class="img_caroussel">
                                <span class="text_caroussel"><?php echo($array_genres[$i]["name"]) ?></span>
                            </div>
                        <?php }
                    } ?>
                </div>
            </div>

            <div class="div_top_10">
                <!-- Morceaux les plus écoutés -->
                <div class="div_top_10_table">
                    <?php if (is_null($array_top_10_singles)) { ?>
                        <div class="div_error_curl">
                            Erreur: Top des morceaux non disponible <br> <br>
                        </div>
                    <?php } else { ?>
                        <div class="div_category_title div_top_10_title">
                            <span class="blue_text">Top <?php echo(count($array_top_10_singles)) ?></span> des morceaux les plus écoutés
                        </div>

                        <?php for ($i=0; $i < count($array_top_10_singles); $i++) { ?>
                            <div class="div_top_10_element div_music_element">
                                <span class="number_top_10"><?php echo(str_pad(($i + 1), 2, "0", STR_PAD_LEFT)); ?></span>
                                <img src=<?php echo($array_top_10_singles[$i]["artist"]["picture"]); ?> class="img_music">
                                <div class="div_music_title_author">
                                    <?php echo($array_top_10_singles[$i]["title"]) ?> <br>
                                    <span class="blue_text author"><?php echo($array_top_10_singles[$i]["artist"]["name"]); ?></span>
                                </div>

                                <div class="div_music_lenght">
                                    <?php echo(getTimeMinutes($array_top_10_singles[$i]["duration"])); ?>
                                </div>
                            </div>
                        <?php }
                        } ?>

                </div>

                <!-- Albums les plus écoutés -->
                <div class="div_top_10_table">
                    <?php if(is_null($array_top_10_albums)) { ?>
                        <div class="div_error_curl">
                            Erreur: Top des albums non disponible
                        </div>
                    <?php } else { ?>
                        <div class="div_category_title div_top_10_title">
                            <span class="blue_text">Top <?php echo(count($array_top_10_albums)) ?></span> des albums les plus écoutés
                        </div>

                        <?php for ($i=0; $i < count($array_top_10_albums); $i++) { ?>
                            <div class="div_top_10_element div_music_element">
                                <span class="number_top_10"><?php echo(str_pad(($i + 1), 2, "0", STR_PAD_LEFT)); ?></span>
                                <img src=<?php echo($array_top_10_albums[$i]["artist"]["picture"]); ?> class="img_music">
                                <div class="div_music_title_author">
                                    <?php echo($array_top_10_albums[$i]["title"]) ?> <br>
                                    <span class="blue_text author"><?php echo($array_top_10_albums[$i]["artist"]["name"]); ?></span>
                                </div>

                                <div class="div_music_lenght">
                                    <?php echo($array_duration_top_10_albums[$i]); ?>
                                </div>
                            </div>
                        <?php }
                    } ?>

                </div>
            </div>

            <!-- Artiste du moment -->
            <?php if(is_null($artist_moment)) { ?>
                <div class="div_artist_moment div_artist_moment_error div_error_curl">
                    Erreur: Artiste du moment non disponible
                </div>
            <?php } else { ?>
                <div class="div_artist_moment" 
                    style="background-image: url(<?php echo($artist_moment["picture_big"]) ?>);">
                    <div class="div_artist_moment_elements">
                        <svg width="100" height="150"> 
                            <circle cx="40" cy="80" r="40" fill="#3BC8E7"/>
                            <polygon points="35,65 35,95 55,80" fill="#FFFFFF"/>
                        </svg>
                        <p id="div_artist_moment_paragraph">
                            Découvrez l'artiste du moment <br>
                            <?php echo($artist_moment["name"]); ?>
                        </p>
                    </div>
                </div>
            <?php } ?>

            <!-- Top des playlists -->
            <div class="div_caroussel">
                <div class="div_category_title div_caroussel_title">
                    <span class="blue_text">Le top</span> des playlists à venir découvrir ou redécouvrir
                    <br>
                </div>

                <div class="div_caroussel_elements_list">
                    <?php if(is_null($array_top_playlists)) { ?>
                        <div class="div_error_curl">
                            Erreur: Top des playlists indisponible
                        </div>
                    <?php } else { ?>
                        <?php for ($i=0; $i < count($array_top_playlists); $i++) { ?>
                            <div class="div_caroussel_one_element">
                                <img src=<?php echo($array_top_playlists[$i]["picture_big"]) ?> class="img_caroussel">
                                <span class="text_caroussel"><?php echo($array_top_playlists[$i]["title"]) ?></span>
                            </div>
                        <?php }
                    } ?>
                </div>
            </div>

            <div class="div_replay_radio">
                <div class="div_category_title div_radio_replay_title">
                    <span class="blue_text">Revivez</span> vos émissions de radio préférées
                </div>

                <?php if(is_null($array_top_radio_replay)) { ?>
                    <div class="div_error_curl">
                        Erreur: Liste des émissions radios indisponible
                    </div>
                <?php } else { ?>
                    <div class="div_replay_radio_images">
                        <?php for ($i=0; $i < count($array_top_radio_replay); $i++) { ?>
                                <img src=<?php echo($array_top_radio_replay[$i]["picture_big"]) ?> class="img_replay_radio">
                        <?php } ?>
                    </div>
                <?php } ?>
            </div>



        </body>

        <footer>
            <div class="footer_info">
                <div class="footer_info_general">
                    <div class="site_name_slogan footer_info_general_titre">
                        <img src="images/Logos/Logo_Music_Band.png" class="img_logo">
                        <div class="div_info_general_name">
                            Music Band
                            <span id="info_general_slogan">La musique au bout des doigts</span>
                        </div>
                    </div>

                    <p id="info_general_paragraphe">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed ante sit amet mi fermentum accumsan. Nulla tristique, lorem eget accumsan efficitur, enim ipsum venenatis massa, mattis eleifend dui nibh sed sem. Vivamus nec quam turpis. Integer auctor leo at convallis malesuada. Praesent cursus feugiat ligula et tristique. Vivamus in velit nec nibh venenatis semper id eu ligula. Nullam dignissim vehicula tempor. Quisque a elementum purus. Maecenas condimentum arcu non nulla feugiat pharetra. Nunc aliquam enim augue, ultricies porta nulla maximus sed.
                        </p>

                </div>

                <div class="footer_info_newsletters">
                    <div class="div_category_title div_footer_title">
                            Inscrivez-vous à la Newsletter
                    </div>

                    <p id="footer_paragraphe">Abonnez-vous à notre newsletter et recevez les dernières mises à jours et offres.</p>

                    <form action="#" method="post" class="form_info_newsletters">
                        <input 
                            type="text"
                            class="input_text newsletter_input" 
                            id="newsletter_name" 
                            placeholder="Entrez votre nom"
                            required>
                        <input 
                            type="email"
                            class="input_text newsletter_input" 
                            id="newsletter_email" 
                            placeholder="Entrez votre email"
                            required>
                        <input type="submit" value="INSCRIVEZ-VOUS" class="general_button blue_button" id="newsletter_button"/>
                    </form>
                </div>

                <div class="footer_info_contact">
                    <div class="div_category_title div_footer_title">
                        Nous contacter
                    </div>

                    <p id="footer_paragraphe">Vous souhaitez nous contacter <br>
                    Plusieurs solutions s'offrent à vous.</p>

                    <div class="div_info_contact_elements_group">
                        <div class="div_info_contact_one_element">
                            <img src="images/Logos/Logo_phone.png" class="img_contact">
                            <div class="div_info_contact_element_text">
                                Par téléphone au:
                                <span class="info_contact_element_value blue_text">03 89 87 85 86</span>
                            </div>
                        </div>
                        <div class="div_info_contact_one_element">
                            <img src="images/Logos/Logo_mail.png" class="img_contact">
                            <div class="div_info_contact_element_text">
                                Par email au:  
                                <span class="info_contact_element_value blue_text">contact[@]musicband.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="div_music_element footer_player">
                <div class="div_player_info">
                    <img src="images/placeholder/TOP_10/S5.png" class="img_music">
                    <div class="div_music_title_author">
                        STAY <br>
                        <span class="blue_text author">The Kid Laroi</span>
                        </div>
                    <div class="div_music_lenght">
                        00:00
                    </div>
                </div>
                <div class="div_footer_player_buttons">
                    <div class="div_footer_player_arrow">
                        <svg width="70" height="100" id="svg_music_previous"> 
                            <rect x="28" y="40" width="3" height="17" fill="#FFFFFF"/>
                            <polygon points="45,38 45,58 30,48" fill="#FFFFFF"/>
                        </svg>
                    </div>

                    <div class="div_footer_player_play">
                        <svg width="90" height="100" id="svg_music_play"> 
                            <circle cx="40" cy="50" r="40" fill="#3BC8E7"/>
                            <polygon points="35,35 35,65 55,50" fill="#FFFFFF"/>
                        </svg>
                    </div>

                    <div class="div_footer_player_arrow">
                        <svg width="70" height="100" id="svg_music_next"> 
                            <rect x="35" y="40" width="3" height="17" fill="#FFFFFF"/>
                            <polygon points="20,38 20,58 35,48" fill="#FFFFFF"/>
                        </svg>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</html>