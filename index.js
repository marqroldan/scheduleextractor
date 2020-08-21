const fs = require("fs");
const { error } = require("console");

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
      }
    });
  });
}
print("./files").catch(console.error);
