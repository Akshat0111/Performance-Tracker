let fs = require('fs');
let path = require('path');
require('chromedriver');
let swd = require('selenium-webdriver');
var chrome = require("selenium-webdriver/chrome");
var chromeOptions = new chrome.Options();
// chromeOptions.addArguments("disable-web-security");
// chromeOptions.addArguments("headless");
// chromeOptions.addArguments("start-maximised");
let bldr = new swd.Builder()
let driver = bldr.forBrowser('chrome').setChromeOptions(chromeOptions).build();
let htmlGenerator = require("./htmlGenerator.js");

let cfile = process.argv[2];

let StdName,StdId,cname,crsURL,Tques=0,Marks,Mhtml;
let fobj = {};

(async function(){
    try
    {
        await driver.manage().setTimeouts({
            implicit:1000
        });
        console.log();
        console.log('Processing Started...');
        console.log();
        //reading credentials file
        let CredContents = await fs.promises.readFile(cfile,'utf-8');
        let obj = JSON.parse(CredContents);
        let un = obj.un;
        let pwd = obj.pwd;

        //opening login page
        await driver.manage().window().maximize();
        await driver.get('https://www.pepcoding.com/login');

        //entering un and pwd after finding fields
        let unField = await driver.findElement(swd.By.css("input[type=email]"));
        let pwdField = await driver.findElement(swd.By.css("input[type=password]"));

        await unField.sendKeys(un);
        await pwdField.sendKeys(pwd);

        //finding login btn and clicking it
        let loginBtn = await driver.findElement(swd.By.css("button[type=submit]"));
        await loginBtn.click();

        //opening profile page and fetching biodata
        let dd = await driver.wait(swd.until.elementLocated(swd.By.css('ul.right.hide-on-med-and-down a')));
        let ddURL = await dd.getAttribute('href');
        await driver.get(ddURL);

        let prof = await driver.wait(swd.until.elementLocated(swd.By.css('ul.dropdown-content a')));
        let profURL = await prof.getAttribute('href');
        await driver.get(profURL);

        let biodata = await driver.wait(swd.until.elementsLocated(swd.By.css('div.col.account h5')));
        StdName = await biodata[0].getText();
        StdId = await biodata[1].getText();
        
        let course = await driver.wait(swd.until.elementLocated(swd.By.css('div.col.l4.s12.m12 h4')));
        cname = await course.getText();
        
        await driver.navigate().back();

        //opening resource page
        let rsrcLink = await driver.wait(swd.until.elementLocated(swd.By.css('div.resource a')));
        let rsrcURL = await rsrcLink.getAttribute('href');
        await driver.get(rsrcURL);

        //waiting for site-overlay to hide
        await waitforOverlayToHide();

        //finding and clicking appropriate course
        let crsElements = await driver.findElements(swd.By.css('h2.courseInput'));
        let crsElementsArr = [];
        for(let i=0;i<crsElements.length;i++)
        {
            let crsText = await crsElements[i].getText();
            crsElementsArr.push(crsText);
        }
        for(let i=0;i<crsElementsArr.length;i++)
        {
            if(crsElementsArr[i] === cname)
            {
                await crsElements[i].click();
                break;
            }
        }

        await waitforOverlayToHide();
        //storing course url
        crsURL = await driver.getCurrentUrl();
        
        //finding total score
        let stats = await driver.wait(swd.until.elementsLocated(swd.By.css('div.card-tabs li')));
        await stats[1].click();

        await waitforOverlayToHide();
        
        let allStud = await driver.wait(swd.until.elementsLocated(swd.By.css('div.row div.col.l2.offset-l3.s7.offset-s3 select.browser-default option')));
        await allStud[4].click();
        await waitforOverlayToHide();

        let NameElements = await driver.findElements(swd.By.css('div#stats ul.collection.with-header li.collection-item.row.no-padding'));
        let NamesArr = [];
        for(let i=0;i<NameElements.length;i++)
        {
            let NameText = await(await NameElements[i].findElement(swd.By.css('span.col.l3.s4'))).getText();
            NamesArr.push(NameText);
        }
        for(let i=0;i<NamesArr.length;i++)
        {
            let m = await(await NameElements[i].findElement(swd.By.css('span.col.l2.s3'))).getText();
            if(NamesArr[i] === StdName)
            {
                Marks = m;
                break;
            }
        }
        

        await stats[0].click();
        await waitforOverlayToHide();

        console.log('Data Fetching Started...')
        console.log()
        //making our json file
        fobj.Name = StdName;
        fobj.Email = StdId;
        fobj.Course = cname;


        /*----------------------------------------------------------------------*/
        let TopicwisePerforma = [];
            let TopicList = await driver.wait(swd.until.elementsLocated(swd.By.css('div#module0 ul.collection.row a')));
            let topicHref = [];
            let topicName = [];
            for(let i=0;i<TopicList.length;i++)
            {
                let topic = await TopicList[i].getAttribute('href');
                let ttext = await TopicList[i].getText();
                topicHref.push(topic);
                topicName.push(ttext);
            }

            for(let i=0;i<topicHref.length;i++)
            {
                //open topic
                await driver.get(topicHref[i]);
                await waitforOverlayToHide();
                
                let Tobj = {};
                let q = 0,csq=0,wq=0,uq=0,Tmarks=0;
                
                let AllQues = await driver.findElements(swd.By.css('ul.collection.resourceList li.collection-item span i.fa.fa-code.blue-text.text-lighten-3'));
                let Qcls = await driver.findElements(swd.By.css('ul.collection.resourceList li.collection-item p'));
                Tques = Tques + AllQues.length;
                q = AllQues.length;
                for(let i=0;i<Qcls.length;i++)
                {
                    let cls = await Qcls[i].getAttribute('class');
                    if(String(cls).includes("green-text"))
                    {
                        csq+=1;
                    }
                    else if(String(cls).includes("red-text"))
                    {
                        wq+=1;
                    }
                }
                uq = AllQues.length-(csq+wq);
                
                let stats = await driver.wait(swd.until.elementsLocated(swd.By.css('div.card-tabs li')));
                await stats[1].click();
                
                await waitforOverlayToHide();
        
                let allStud = await driver.wait(swd.until.elementsLocated(swd.By.css('div.row div.col.l2.offset-l3.s7.offset-s3 select.browser-default option')));
                await allStud[4].click();
                await waitforOverlayToHide();

                let NameElements = await driver.findElements(swd.By.css('div#stats ul.collection.with-header li.collection-item.row.no-padding'));
                let NamesArr = [];
                for(let i=0;i<NameElements.length;i++)
                {
                    let NameText = await(await NameElements[i].findElement(swd.By.css('span.col.l3.s4'))).getText();
                    NamesArr.push(NameText);
                }
                for(let i=0;i<NamesArr.length;i++)
                {
                    let m = await(await NameElements[i].findElement(swd.By.css('span.col.l2.s3'))).getText();
                    if(NamesArr[i] === StdName)
                    {
                        Tmarks = m;
                        break;
                    }
                }
                
                console.log("Fetching Data For Topic : " +" "+ topicName[i]);
                //Tobj filling
                Tobj.TopicName = topicName[i];
                Tobj.TotalQuestions = q;
                Tobj.SubmittedQuestion = csq;
                Tobj.WrongQuestion = wq;
                Tobj.UnattemptedQuestion = uq;
                let a = q*10;
                let str = Tmarks + " out of " + a;
                Tobj.Score = str;

                TopicwisePerforma.push(Tobj);

                await driver.get(crsURL);
                await waitforOverlayToHide();
            }
             
            fobj.Topics = TopicwisePerforma;;
        /*----------------------------------------------------------------------*/
        let a = Tques*10;
        let str = Marks + " out of " + a;
        fobj.Score = str;
        
        await fs.promises.writeFile('Performance.json', JSON.stringify(fobj));
        console.log()
        console.log('Data Fetching Done....');
        console.log()

        Mhtml = htmlGenerator("Performace Report of "+ StdName );
        await fs.promises.writeFile('Html.html', Mhtml);
        
        let path = __dirname
        path = path.split('\\').join('/');

        let url = 'file://'+ path +'/Html.html';
        console.log("Processing Completed...");
        console.log()
        await driver.get(url);

    }
    catch(err)
    {
        console.log(err);
    }
})();


// async function helper()
// {
//     return new Promise(async function(resolve,reject){
//         try
//         {
//             let TopicwisePerforma = [];
//             let TopicList = await driver.wait(swd.until.elementsLocated(swd.By.css('div#module0 ul.collection.row a')));
//             let topicHref = [];
//             let topicName = [];
//             for(let i=0;i<TopicList.length;i++)
//             {
//                 let topic = await TopicList[i].getAttribute('href');
//                 let ttext = await TopicList[i].getText();
//                 topicHref.push(topic);
//                 topicName.push(ttext);
//             }

//             for(let i=0;i<topicHref.length;i++)
//             {
//                 //open topic
//                 await driver.get(topicHref[i]);
//                 await waitforOverlayToHide();
                
//                 let Tobj = {};
//                 let q = 0,csq=0,wq=0,uq=0,Tmarks=0;
                
//                 let AllQues = await driver.findElements(swd.By.css('ul.collection.resourceList li.collection-item span i.fa.fa-code.blue-text.text-lighten-3'));
//                 let Qcls = await driver.findElements(swd.By.css('ul.collection.resourceList li.collection-item p'));
//                 Tques = Tques + AllQues.length;
//                 q = AllQues.length;
//                 for(let i=0;i<Qcls.length;i++)
//                 {
//                     let cls = await Qcls[i].getAttribute('class');
//                     if(String(cls).includes("green-text"))
//                     {
//                         csq+=1;
//                     }
//                     else if(String(cls).includes("red-text"))
//                     {
//                         wq+=1;
//                     }
//                 }
//                 uq = AllQues.length-(csq+wq);
                
//                 let stats = await driver.wait(swd.until.elementsLocated(swd.By.css('div.card-tabs li')));
//                 await stats[1].click();
                
//                 await waitforOverlayToHide();
        
//                 let allStud = await driver.wait(swd.until.elementsLocated(swd.By.css('div.row div.col.l2.offset-l3.s7.offset-s3 select.browser-default option')));
//                 await allStud[4].click();
//                 await waitforOverlayToHide();

//                 let NameElements = await driver.findElements(swd.By.css('div#stats ul.collection.with-header li.collection-item.row.no-padding'));
//                 let NamesArr = [];
//                 for(let i=0;i<NameElements.length;i++)
//                 {
//                     let NameText = await(await NameElements[i].findElement(swd.By.css('span.col.l3.s4'))).getText();
//                     NamesArr.push(NameText);
//                 }
//                 for(let i=0;i<NamesArr.length;i++)
//                 {
//                     let m = await(await NameElements[i].findElement(swd.By.css('span.col.l2.s3'))).getText();
//                     if(NamesArr[i] === StdName)
//                     {
//                         Tmarks = m;
//                         break;
//                     }
//                 }
                
//                 //Tobj filling
//                 Tobj.TopicName = topicName[i];
//                 Tobj.TotalQuestions = q;
//                 Tobj.SubmittedQuestion = csq;
//                 Tobj.WrongQuestion = wq;
//                 Tobj.UnattemptedQuestion = uq;
//                 let a = q*10;
//                 let str = Tmarks + " out of " + a;
//                 Tobj.Score = str;

//                 TopicwisePerforma.push(Tobj);

//                 await driver.get(crsURL);
//                 await waitforOverlayToHide();
//             }
//             resolve();
//             return TopicwisePerforma;
              
//         }
//         catch(err)
//         {
//             console.log(err);
//         }
//     });
// }
async function waitforOverlayToHide() {
    return new Promise(async function (resolve, reject) {
        try{
          let soe = await driver.findElement(swd.By.css("div#siteOverlay"));
          await driver.wait(swd.until.elementIsNotVisible(soe),10000);
          resolve();
        }
        catch(err)
        {
            console.log(err);
        }
    });
}