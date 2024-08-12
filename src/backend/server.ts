import * as express from "express";
import * as cors from "cors";
import "dotenv/config"
import { createBaseServer } from "../../utils/backend/base_backend/create";


const APP_ID = process.env.CANVA_APP_ID?.toLowerCase(); // The ID must be lowercase

if (!APP_ID) {
  throw new Error(`CANVA_APP_ID environment variable is not set`);
}

const router = express.Router();

router.use(
  cors({
    origin: `https://app-aaglscxbhew.canva-apps.com`,
    optionsSuccessStatus: 200,
  })
);

router.get('/', async (req, res) => {

  let url = req.query.url?.toString();

  if (!url) {
      return res.sendStatus(401);
  }

  let website = await fetch(
    url!,
  ).catch((_error) => {
    console.log("That was not a possible url");
    return undefined;
  }).then((response) => {
    if (response?.status != 200) {
      console.log("Website not allowed");
      console.log(response?.text());
      return undefined;
    }

    console.log("That was a reached website")
    return response?.text();
  });

  if (typeof website == 'undefined') {
    console.log("That website had nothing on it");
    return res.sendStatus(401);
  }

//  console.log(website);

  let info: {
    names: string[],
    date: Date,
    title: string,
    version: string,
    publisher: string,
    location: string,
    url: string,
  } = {
    names: [""],
    date: new Date,
    title: "",
    version: "",
    publisher: "",
    location: "",
    url: url!,
  }
  /**
   * Getting the authors of the website
   */
  let author = website.indexOf(`"author":`);

//  console.log(author);

//  console.log(website.slice(author+2, author+5));

  for (; website.charAt(author + 9) == ' '; author++);

  if (website.charAt(author + 9) != '[' && website.charAt(author + 9) == '"') {
    info["names"] = website.slice(author + 10, website.indexOf('"', author + 11)).split(',');
  } else {
    var end = author + 10
//    console.log(website.slice(end - 2, end + 2));
    for (var c = 1; c > 0; end++) {
      if (website.charAt(end) == '[') {
        c++;
        console.log("Found [ at " + end);
      } else if (website.charAt(end) == ']') {
        c--;
        console.log("Found ] at " + end);
      }
    }

//    console.log(website.slice(author + 10, end));

    info["names"] = website.slice(author + 10, end).split('},{').map<string>((str, _ind, _arr) => {
      return str.slice(str.indexOf('"', str.indexOf(`"name":`) + 7) + 1, str.indexOf('"', str.indexOf('"', str.indexOf(`"name":`) + 7) + 1));
    });
  }
  console.log(info["names"]);
  /**
   * Getting the date published of website
   */

  let date = website.indexOf(`"dateModified"`);

  info["date"] = new Date(website.slice(website.indexOf('"', date + 15) + 1, website.indexOf('"', website.indexOf('"', date + 15) + 1)));
  console.log(info["date"]);


  /**
   * Getting the title of the website
   */
  let title = website.indexOf('<title');

  info['title'] = website.slice(website.indexOf('>', title) + 1, website.indexOf('<', title + 1));


  /**
   * Getting publisher of the website
   */
  let publisher = website.indexOf(`"author":`);

  info['publisher'] = website.slice(website.indexOf('"name":', publisher) + 1, website.indexOf('"', website.indexOf('"name":', publisher + 6)));

  res.json(info);
});

const server = createBaseServer(router);
server.start(process.env.CANVA_BACKEND_PORT);