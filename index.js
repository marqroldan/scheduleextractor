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
        /*
        const parsedData = parse(contents);
        const selectedSchoolYear = parsedData.querySelector(
          ".tableStyle1 tbody"
        );

        const a = selectedSchoolYear.childNodes[1].childNodes;
        if (false) {
          a.map((item) => {
            console.log("ch", item.childNodes);
          });
        }

        console.log("SelectedSchoolYear", selectedSchoolYear.childNodes[0]);
        */
      }
    });
  });
}
print("./files").catch(console.error);
