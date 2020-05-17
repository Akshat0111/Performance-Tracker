let fs = require('fs');

let MainHtml = "";
module.exports = function (data) {
let MetaData = fs.readFileSync('./Performance.json');
let obj = JSON.parse(MetaData);
MainHtml += " <html>   <head> <title> Performance Report </title> "
MainHtml += " <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'> " 
MainHtml += " <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script> "
MainHtml += " <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script> "
MainHtml += " <meta name='viewport' content='width=device-width, initial-scale=1'> "
MainHtml += " <link rel='stylesheet' href='html.css' type='text/css'> "
MainHtml += " </head> "
MainHtml += " <body> " 
MainHtml += " <div class='container' style = 'margin-top : 5%; margin-bottom : 5%'> "

MainHtml += " <center> <h1 style = 'font-size : 50px'><b> "  + data + "</b></h1> </center> "

MainHtml += "<hr style='border: 5px solid black;border-radius: 2px;'>"

let TotalTopics = obj.Topics;

MainHtml += "<div'><center> <h1 style = 'font-size : 30px; margin-bottom:2%;'><b> Student's Information </b></h1> </center>"
MainHtml += "<div style = 'margin : 2%;'>"
MainHtml += "<div>"
MainHtml += "<div>"
MainHtml += "<h3>  Name  : " + obj.Name + "</h3></div>"
MainHtml += "<div>"
MainHtml += "<h3>  Email  : " + obj.Email + "</h3></div"
MainHtml += "<div>"
MainHtml += "<h3> Enrolled In Course  : " + obj.Course + "</h3></div>"
MainHtml += "<div>"
MainHtml += "<h3>  Total Score  : <b style = 'font-size : 40px'>" + obj.Score + "</b></h3></div><br>"

MainHtml += "<div'><center> <h1 style = 'font-size : 30px;margin-top:2%;margin-bottom:2%;'><b> Topicwise Detailed Report </b></h1> </center>"
for(let i = 0 ; i < TotalTopics.length ; i++)
{
    TopicsFunc(TotalTopics[i]);  
} 
MainHtml += "</div>"; 
MainHtml += "</div></div></div><hr style='border: 0;border-bottom: 1px dashed #ccc;background: #888888;'>"
MainHtml += " </div> </body> </html>"
return MainHtml
}

function TopicsFunc(data)
{
    MainHtml += "<div style = 'margin : 4%'> <ul style='list-style-type: square' >"
    MainHtml += "<h3 style='font-weight:bold;'><li> Topic Name : " + data.TopicName + "</li></h3>"
    MainHtml += "<h4 style = 'margin-left : 2%;'> Submitted Questions : <b style='color:#006400;'>" + data.SubmittedQuestion + "</b> / " + data.TotalQuestions + "</h4>"
    MainHtml += "<h4 style = 'margin-left : 2%'> Wrong or Partially Submitted Questions : <marks style='color:#8b0000;'>" + data.WrongQuestion + "</marks></h4>"
    MainHtml += "<h4 style = 'margin-left : 2%'> Unattempted Questions : <marks style='color:black;'>" + data.UnattemptedQuestion + "</marks></h4>"
    MainHtml += "<h4 style = 'margin-left : 2%'> Total Score : <b>" + data.Score + "</b></h4>"
    MainHtml += "</ul></div>"
}