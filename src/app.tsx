import { Button, Rows, Text, FormField, TextInput, MultilineInput, Select } from "@canva/app-ui-kit";
import { addNativeElement } from "@canva/design";
import styles from "styles/components.css";
import { auth } from "@canva/user";
import { val } from "cheerio/lib/api/attributes";
import { decodeAndVerifyDesignToken } from "examples/design_token/backend/decode_jwt";
import { node } from "webpack";

export const App = () => {

  let citationSources = "";

  let citationType = '';

  let citations: [{
    names: string[],
    date: Date,
    title: string,
    version: string,
    publisher: string,
    location: string,
    url: string,
  }] = [{
    names: [""],
    date: new Date,
    title: "",
    version: "",
    publisher: "",
    location: "",
    url: "",
  }];

  let buttonText = "MLA";

  const createCitations = async () => {

    const authToken = await auth.getCanvaUserToken();

    let sources = citationSources.split("\n");

    console.log(sources);

    for (var i = 0; i < sources.length; i++) {

      for (var j = 0; j < citations.length; j++) {
        if (sources[i] == citations[j].url) {
          citations.splice(j, j);
        }
      }

      console.log(sources[i]);

      var response = await fetch(
        `${BACKEND_HOST}?url=${sources[i]}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      if (response.status == 401) {
        continue;
      }

      citations.push(await response.json());
    }

    generateCitations(citationType);

    // for (var i = 1; i < citations.length; i++) {
    //   // let citation = JSON.stringify(citations[i]);

    //   // addNativeElement({
    //   //   type: "TEXT",
    //   //   children: [citation],
    //   // }); 


    // }
  };

  function getNames(name: string) {
    let fullName = name.split(' ');

    if (fullName.length == 1) {
      return {
        firstName: fullName[0],
        middleName: "",
        lastName: "",
      }
    } else if (fullName.length == 2) {
      return {
        firstName: fullName[0],
        middleName: "",
        lastName: fullName[1],
      }
    } else {
      return {
        firstName: fullName[0],
        middleName: " " + fullName[1],
        lastName: fullName[2],
      }
    }
  }

  function sortFunct(a: {
    names: string[],
    date: Date,
    title: string,
    version: string,
    publisher: string,
    location: string,
    url: string,
  }, b: {
    names: string[],
    date: Date,
    title: string,
    version: string,
    publisher: string,
    location: string,
    url: string,
  }) {

    let aUse = 2;
    let bUse = 2;

    if (!a.names[0]) {
      aUse--;
      if (!a.publisher) {
        aUse--;
      } 
    }
    if (!b.names[0]) {
      bUse--;
      if (!b.publisher) {
        bUse--;
      }
    }

    if (aUse == 0 && bUse == 0) {
      return 0;
    } else if (aUse == 0) {
      return -1;
    } else if (bUse == 0) {
      return 1;
    } else {
      let aComp = '';
      let bComp = '';
      
      if (aUse == 2) {
        let aName = getNames(a.names[0]);
        aComp = aName.lastName + aName.firstName + aName.lastName;
      } else {
        aComp = a.publisher;
      }

      if (bUse == 2) {
        let bName = getNames(b.names[0]);
        bComp = bName.lastName + bName.firstName + bName.lastName;
      } else {
        bComp = b.publisher;
      }

      return aComp.localeCompare(bComp);
    }
  }

  async function generateCitations(value: string) {

    if (!value) {
      addNativeElement({
        type: "TEXT",
        children: ['Please enter a citation type'],
        fontSize: 20,
        width: 100,
        top: 0,
        left: 0,
      });
    }

    let finalText = '';

    let cites: string[] = [];

    /**
   * MLA Citation Guide:
   * [Last Name], [First Name] [Middle Name]. [Title (Italics for individual work, quotationed and followed by container if not (e.g webpage))] [. [Other contributers], [Version], [Number of sequence]],
   *    . [Publisher], [Date], [Location (Page number, website without https, physical location)].[URL]
   */
    if (value == 'mla') {
      for (var i = 1; i < citations.length; i++) {
        let citation = citations[i];
        let text = '';
        let hasAuthor = true;

        // Add the name(s) of the author(s)
        if (citation.names[0]) {
          if (citation.names.length == 1) {
            let name = getNames(citation.names[0]);
            text += `${name.lastName}, ${name.firstName}${name.middleName}.`;
          } else if (citation.names.length == 2) {
            let name1 = getNames(citation.names[0]);
            let name2 = getNames(citation.names[1]);

            text += `${name1.lastName}, ${name1.firstName}${name1.middleName}, and ${name2.lastName}, ${name2.firstName}${name2.middleName}.`;
          } else if (citation.names.length == 0) {
            text += `${citation.publisher}`;
            hasAuthor = false;
          } else {
            let name = getNames(citation.names[0]);
            text += `${name.lastName}, ${name.firstName}${name.lastName}, et al.`;
          }
        } else {
          text += '[Author not found].';
        }

        // Add title of source
        if (citation.title) {
          text += ` ${citation.title}.`;
        } else {
          text += ' [Title Not found].'
        }

        // Add publisher if not the author
        if (hasAuthor && citation.publisher) {
          text += ` ${citation.publisher},`;
        } else if (!hasAuthor) {
          text += ' [Publisher not found],'
        }

        // Add date
        if (citation.date) {
          text += ` ${new Date(citation.date).toDateString()}.`;
        } else {
          text += ' [Date not found].'
        }

        // Add url
        text += ` ${citation.url}`;

        console.log(text);

        cites.push(text);

        console.log(cites);
      }
    /**
    * APA Citation Guide
    * [Last Name], [initials] (multiples are seperated by commas and '&', and same initial and last name has full name in a [] e.g (Last Name) (Initial) [(First Name)] ).
    *    ([Date published]) ("(n.d)" for no date). [Title of work] (Similar to MLA). [Location of publisher] (In US, city then two letter state, outside, city then country): [Publisher]. [URL]
    */
    } else if (value == 'apa') {
      /**
       * TODO:
       * Create the APA citation compilation.
       */
      for (var i = 1; i < citations.length; i++) {
        let citation = citations[i];
        let text = '';
        let hasAuthor = true;

        // Add the name(s) of the author(s)
        if (citation.names[0]) {
          if (citation.names.length == 1) {
            let name = getNames(citation.names[0]);
            text += `${name.lastName}, ${name.firstName[0]}${name.middleName.slice(0, 2)}.`;
          } else if (citation.names.length == 2) {
            let name1 = getNames(citation.names[0]);
            let name2 = getNames(citation.names[1]);

            text += `${name1.lastName}, ${name1.firstName[0]}${name1.middleName.slice(0, 2)}, and ${name2.lastName}, ${name2.firstName[0]}${name2.middleName.slice(0, 2)}.`;
          } else if (citation.names.length == 0) {
            text += `${citation.publisher}`;
            hasAuthor = false;
          } else {
            let name = getNames(citation.names[0]);
            text += `${name.lastName}, ${name.firstName[0]}${name.lastName.slice(0, 2)}, et al.`;
          }
        } else {
          text += '[Author not found].';
        }

        // Add date
        if (citation.date) {
          text += ` ${new Date(citation.date).toDateString()}.`;
        } else {
          text += ' [Date not found].'
        }

        // Add title of source
        if (citation.title) {
          text += ` ${citation.title}.`;
        } else {
          text += ' [Title Not found].'
        }

        // Add publisher if not the author
        if (hasAuthor && citation.publisher) {
          text += ` ${citation.publisher}.`;
        } else if (!hasAuthor) {
          text += ' [Publisher not found].'
        }

        

        // Add url
        text += ` ${citation.url}`;

        console.log(text);

        cites.push(text);
    }
  }
  cites.sort();

  console.log(cites);

  for (var i = 0; i < cites.length; i++) {
    finalText += `${cites[i]}\n\n`;
  }

  console.log(finalText);

  if (finalText != '') {
    addNativeElement({
      type: "TEXT",
      children: [finalText],
      fontSize: 10,
      width: 400,
      top: 0,
      left: 0,
    });
  } else {
    addNativeElement({
      type: "TEXT",
      children: ["Please enter URLs to cite"],
      fontSize: 20,
      width: 100,
      top: 0,
      left: 0,
    });
  }

  citationSources = '';
  citations = [{
    names: [""],
    date: new Date,
    title: "",
    version: "",
    publisher: "",
    location: "",
    url: "",
  }];
}

  return (
    <div className={styles.scrollContainer}>
      
      <Rows spacing="1.5u">
        <Text>
          Welcome to the citation maker. Insert the url of the citation you wish to create. To create multiple automatic citations, seperate by a new line. Any errors in reaching
          information will be found in square brackets [].
        </Text>

        <FormField
          label="Insert text"
          control={(props) => (

            <MultilineInput autoGrow
            onChange={(value: string) => (
              citationSources = value
          )}
            {...props}
      
            />
          )}
        />

        <Select options={[
          {
            label: 'MLA',
            value: 'mla',
          },
          {
            label: 'APA',
            value: 'apa',
          }
        ]} onChange={(value) => {citationType = value} }>
        </Select>

        <Button variant="primary" onClick={createCitations} stretch>
          Create citation
        </Button>

      </Rows>

    </div>
  );
};
