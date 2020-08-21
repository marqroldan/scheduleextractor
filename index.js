const fs = require("fs");
//const { parse } = require("node-html-parser");
const { error } = require("console");

const startingDay = 1;

const regex = RegExp(/(.*?.)(.html)/gm);
const data = {
  /** [studentID]: {
   *  selectedSchoolYear: "XXXX - XXXX",
   *  selectedTerm: "TERM X",
   *  subjectsTimeBlock: {
   *   [timeBlock]: {
   *      [day]: {
   *          courseCode: '',
   *          section: '',
   *          room: '',
   *      }
   *   }
   *  },
   *  subjectsDay: {
   *   [day]: {
   *      [timeBlock]: {
   *          courseCode: '',
   *          section: '',
   *          room: '',
   *      }
   *   }
   *  }
   * } */
};

const matchers = {
  selectedSchoolYear: /((<option selected="selected").*?>)(.*?)(<\/option>)/gm,
  selectedTerm: /("aspNetDisabled">)(.*?)(<\/)/gm,
  tableRow: /(<tr class="setHeight">)(.*?)(<\/tr>)/gm,
  tableCell: /(?:<td(?:.*?)>(.*?)(?:<\/td>))/gm,
};

async function print(path) {
  const files = await fs.promises.readdir(path);
  const filtered = files.filter((item) => regex.test(item));

  filtered.map((file) => {
    const filePath = `${path}/${file}`;
    const studentID = file.split(".").shift();
    console.log(file, studentID);

    fs.readFile(filePath, "utf8", function (err, contents) {
      if (err) {
        console.log("-----------------");
        console.log("Something happened with: ", filePath);
        console.log("Here's the error object");
        console.log(err);
        console.log("-----------------");
      } else {
        const selectedSchoolYear = matchers.selectedSchoolYear.exec(
          contents
        )[3];
        const selectedTerm = matchers.selectedTerm.exec(contents)[2];
        const regex = matchers.tableRow;
        while ((m = regex.exec(contents)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          // The result can be accessed through the `m`-variable.
          const targetMatch = m[2];
          if (targetMatch) {
            console.log("match", targetMatch);
            console.log("===============!!!==============");
            const regex2 = matchers.tableCell;
            while ((cell = regex2.exec(targetMatch)) !== null) {
              // This is necessary to avoid infinite loops with zero-width matches
              if (cell.index === regex2.lastIndex) {
                regex2.lastIndex++;
              }
              const cellValue = cell[1];
              console.log("Cell Value", cellValue);
            }

            console.log("????????????????????????????????????");
          }
        }
      }
    });
  });
}
print("./files").catch(console.error);
