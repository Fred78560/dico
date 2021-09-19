exports.action = function(data){

    var reg="/"+data.dico+"(.+)/i" ; var rgxp = eval(reg) ; var temp = JarvisIA.reco.match(rgxp) ; console.log(temp)
var phrase = temp[1].trim() ; console.log("on envoie : ",phrase)
phrase=phrase.replace(/ /gi,'-').replace(/[à|â|ä]/g,"a").replace(/[é|è|ê|ë]/g,"e").replace(/[ï|î]/g,"i").replace(/[ö|ô]/g,"o").replace(/[ù|û|ü]/g,"u").replace(/ÿ/g,"y").replace(/œ/g,"oe").replace(/æ/g,"ae").replace(/ç/g,"c")
 var moment = require('moment');moment.locale('fr');

console.log("Jarvis doit chercher la définition de "+phrase)
   
    var fs = require("fs");
    var path = require('path');
    var filePath = __dirname + "/SaveDefinitions.json";
    var file_content;

    file_content = fs.readFileSync(filePath, 'utf8');
    file_content = JSON.parse(file_content);

    if(typeof file_content[phrase] != 'undefined' && file_content[phrase] != "") {
        var infos = file_content[phrase];
        console.log("Informations: " + infos);
        JarvisIASpeech(infos);
        return;

    } else {
         var url = "https://www.larousse.fr/dictionnaires/francais/"+phrase;
        console.log('Url Request: ' + url);
        var request = require('request');
        var cheerio = require('cheerio');

        request({ 'uri': url}, function(error, response, html) {

            if (error || response.statusCode != 200) {
                JarvisIASpeech("La requête vers Google a échoué. Erreur " + response.statusCode );
                return;
            }
            var $ = cheerio.load(html);

            var definition = $('li.DivisionDefinition:nth-child(1)').first().text().trim(); 
            if(definition == "") { // Si la première version n'existe pas on teste l'autre
                var definition = $('li.DivisionDefinition:nth-child(1)').first().text().trim();
            }

            if(definition == "") {
                console.log("Impossible de récupérer les informations.");
                JarvisIASpeech("Désolé, je n'ai pas réussi à trouver la définition du mot "+phrase);
            } else {
                file_content[phrase] = definition;
                chaine = JSON.stringify(file_content, null, '\t');
                fs.writeFile(filePath, chaine, function (err) {
                    console.log("[ --- "+phrase+" --- ] Définition enregistrés");
                });

                console.log("Informations: " + definition);
                JarvisIASpeech(definition);
            }
            return;
        });
    }
    
}

