const fs = require("fs");
//const { parse } = require("node-html-parser");
const { error } = require("console");

const startingDay = 1;

const config = {
  schedulesPath: "./files",
  output: "./output",
};

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
  //UPDATED VERSION ================================
  /** [studentID]: {
   *    [schoolYear]: {
   *      [term]: {
   *        subjects: {
   *          [courseCode]: {
   *            blocks: number,
   *            section: string,
   *            rooms: [],
   *            days: [],
   *            timeblocks: [],
   *            dayTimeBlocks: [],
   *            dayTimeRoomBlocks: [],
   *          }
   *        },
   *      }
   *    }
   * } */
};

/**
 *
 * Time Blocks
 * 0 - 7:30
 * 1 - 9:00
 * 2 - 10:30
 * 3 - 12:00
 * 4 - 1:30
 * 5 - 3:00
 * 6 - 4:30
 * 7 - 6:00
 * 8 - 7:30
 *
 */

const saveData = (data) => {
  const sData = JSON.stringify(data);
  // console.log("data", JSON.stringify(data));
  /*
  For some reason using date as file name fails
  */
  const fileName = "output"; // new Date().toISOString().replace(":", "");

  fs.writeFile(`${config.output}/${fileName}.json`, sData, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
};

const pushNoDuplicate = (array, value) => {
  if (!array.includes(value)) {
    array.push(value);
  }
};

const resetMatchers = (arr) => {
  arr.map((item) => {
    item.lastIndex = 0;
  });
};

const matchers = {
  file: /(.*?)(.html)/m,
  selectedSchoolYear: /((<option selected="selected").*?>)(.*?)(<\/option>)/gm,
  selectedTerm: /("aspNetDisabled">)(.*?)(<\/)/gm,
  tableRow: /(<tr class="setHeight">)(.*?)(<\/tr>)/gm,
  tableCell: /(?:<td(?:.*?)>(.*?)(?:<\/td>))/gm,
};

async function generateJSONSchedule(path) {
  const files = await fs.promises.readdir(path);
  const filtered = files.filter((item) => matchers.file.test(item));
  let currentDone = 0;

  filtered.map((file) => {
    const filePath = `${path}/${file}`;
    const studentID = file.split(".").shift();
    console.log(file, studentID);
    if (!data[studentID]) {
      data[studentID] = {};
    }
    const studentData = data[studentID];

    fs.readFile(filePath, "utf8", function (err, contents) {
      resetMatchers([
        matchers.selectedSchoolYear,
        matchers.selectedTerm,
        matchers.tableCell,
        matchers.tableRow,
      ]);
      if (err) {
        console.log("-----------------");
        console.log("Something happened with: ", filePath);
        console.log("Here's the error object");
        console.log(err);
        console.log("-----------------");
      } else {
        let selectedSchoolYear = matchers.selectedSchoolYear.exec(contents);

        if (!selectedSchoolYear) {
          currentDone++;
          console.log("Failed for: ", filePath);
          return;
        } else {
          selectedSchoolYear = selectedSchoolYear[3];
        }

        const selectedTerm = matchers.selectedTerm.exec(contents)[2];

        if (!studentData[selectedSchoolYear]) {
          studentData[selectedSchoolYear] = {};
        }

        if (!studentData[selectedSchoolYear][selectedTerm]) {
          studentData[selectedSchoolYear][selectedTerm] = {};
        }

        if (!studentData[selectedSchoolYear][selectedTerm].subjects) {
          studentData[selectedSchoolYear][selectedTerm]["subjects"] = {};
        }

        const studentSubjects =
          studentData[selectedSchoolYear][selectedTerm]["subjects"];

        let currRow = 0;
        const regex = matchers.tableRow;
        while ((m = regex.exec(contents)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          // The result can be accessed through the `m`-variable.
          const targetMatch = m[2];
          // console.log("match", targetMatch);
          // console.log("===============!!!==============");
          if (targetMatch) {
            const regex2 = matchers.tableCell;
            let currCol = 0;
            while ((cell = regex2.exec(targetMatch)) !== null) {
              // This is necessary to avoid infinite loops with zero-width matches
              if (cell.index === regex2.lastIndex) {
                regex2.lastIndex++;
              }
              const cellValue = cell[1];
              let subjectObject = (cellValue || "").split("<br>");
              if (subjectObject.length == 3) {
                subjectObject = {
                  courseCode: subjectObject[0],
                  section: subjectObject[1],
                  room: subjectObject[2],
                  timeblock: currRow,
                  day: currCol % 7,
                };
                subjectObject.dayTimeBlock = `${subjectObject.day}-${subjectObject.timeblock}`;
                subjectObject.dayTimeRoomBlock = `${subjectObject.day}-${subjectObject.timeblock}-${subjectObject.room}`;
              } else if (subjectObject.length == 2) {
                subjectObject = subjectObject.join("");
              } else {
                subjectObject = {};
              }

              if (subjectObject.courseCode) {
                if (!studentSubjects[subjectObject.courseCode]) {
                  studentSubjects[subjectObject.courseCode] = {
                    blocks: 1,
                    section: subjectObject.section,
                    rooms: [subjectObject.room],
                    timeblocks: [subjectObject.timeblock],
                    days: [subjectObject.day],
                  };
                  studentSubjects[subjectObject.courseCode].dayTimeBlocks = [
                    subjectObject.dayTimeBlock,
                  ];
                  studentSubjects[
                    subjectObject.courseCode
                  ].dayTimeRoomBlocks = [subjectObject.dayTimeRoomBlock];
                } else {
                  studentSubjects[subjectObject.courseCode].blocks++;

                  pushNoDuplicate(
                    studentSubjects[subjectObject.courseCode].rooms,
                    subjectObject.room
                  );
                  pushNoDuplicate(
                    studentSubjects[subjectObject.courseCode].timeblocks,
                    subjectObject.timeblock
                  );
                  pushNoDuplicate(
                    studentSubjects[subjectObject.courseCode].days,
                    subjectObject.day
                  );
                  pushNoDuplicate(
                    studentSubjects[subjectObject.courseCode].dayTimeBlocks,
                    subjectObject.dayTimeBlock
                  );
                  pushNoDuplicate(
                    studentSubjects[subjectObject.courseCode].dayTimeRoomBlocks,
                    subjectObject.dayTimeRoomBlock
                  );
                }
              }
              //console.log("SubjectObject", subjectObject);
              currCol++;
            }
            //console.log("????????????????????????????????????");
          }
          currRow++;
        }
      }
      currentDone++;
      if (currentDone === filtered.length) {
        saveData(data);
      }
    });
  });
}

generateJSONSchedule(config.schedulesPath).catch(console.error);
