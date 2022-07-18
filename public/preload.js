const { split, map } = require("./lib");
const node_process = require("process");
const node_child = require("child_process");
const { shell } = require("electron");
const fs = require("fs");

const parseDate = (s) => new Date(s);
const parseString = (s) => {
  if (s[0] === "\"" && s[s.length - 1] === "\"") return s.slice(1, -1);
  return s;
};
const parseBoolean = (s) => s.toLowerCase() === "true";
const parseArray = (f) => (l, p) =>
  l.slice(2, -2)
    .split(",\n")
    .map((s) => s.replace(/^\s+/, ""))
    .map(f);
const parseArrayOfStrings = parseArray(parseString);
const attributes = {
  "_kMDItemOwnerUserID": parseInt,
  kMDItemAcquisitionMake: parseString,
  kMDItemAcquisitionModel: parseString,
  kMDItemAlbum: parseString,
  kMDItemAperture: parseString,
  kMDItemAppleLoopDescriptors: parseArrayOfStrings,
  kMDItemAppleLoopsKeyFilterType: parseString,
  kMDItemAppleLoopsLoopMode: parseString,
  kMDItemAppleLoopsRootKey: parseString,
  kMDItemAttributeChangeDate: parseDate,
  kMDItemAudiences: parseArrayOfStrings,
  kMDItemAudioBitRate: parseFloat,
  kMDItemAudioChannelCount: parseInt,
  kMDItemAudioEncodingApplication: parseString,
  kMDItemAudioSampleRate: parseFloat,
  kMDItemAudioTrackNumber: parseInt,
  kMDItemAuthors: parseArrayOfStrings,
  kMDItemAuthorAddresses: parseArrayOfStrings,
  kMDItemBitsPerSample: parseInt,
  kMDItemCity: parseString,
  kMDItemCodecs: parseArrayOfStrings,
  kMDItemColorSpace: parseString,
  kMDItemComment: parseString,
  kMDItemComposer: parseString,
  kMDItemContactKeywords: parseArrayOfStrings,
  kMDItemContentCreationDate: parseDate,
  kMDItemContentModificationDate: parseDate,
  kMDItemContentType: parseString,
  kMDItemContentTypeTree: parseArrayOfStrings,
  kMDItemContributors: parseArrayOfStrings,
  kMDItemCopyright: parseString,
  kMDItemCountry: parseString,
  kMDItemCoverage: parseString,
  kMDItemCreator: parseString,
  kMDItemDateAdded: parseDate,
  kMDItemDeliveryType: parseString,
  kMDItemDescription: parseString,
  kMDItemDisplayName: parseString,
  kMDItemDownloadedDate: parseArray(parseDate),
  kMDItemDueDate: parseDate,
  kMDItemDurationSeconds: parseFloat,
  kMDItemEmailAddresses: parseArrayOfStrings,
  kMDItemEncodingApplications: parseArrayOfStrings,
  kMDItemEXIFVersion: parseString,
  kMDItemExposureMode: parseInt,
  kMDItemExposureProgram: parseString,
  kMDItemExposureTimeSeconds: parseFloat,
  kMDItemExposureTimeString: parseString,
  kMDItemFinderComment: parseString,
  kMDItemFlashOnOff: parseBoolean,
  kMDItemFNumber: parseFloat,
  kMDItemFocalLength: parseFloat,
  kMDItemFonts: parseArrayOfStrings,
  kMDItemFSContentChangeDate: parseDate,
  kMDItemFSCreationDate: parseDate,
  kMDItemFSCreatorCode: parseString,
  kMDItemFSFinderFlags: parseInt,
  kMDItemFSHasCustomIcon: parseInt,
  kMDItemFSInvisible: parseBoolean,
  kMDItemFSIsExtensionHidden: parseBoolean,
  kMDItemFSIsStationery: parseBoolean,
  kMDItemFSLabel: parseInt,
  kMDItemFSName: parseString,
  kMDItemFSNodeCount: parseInt,
  kMDItemFSOwnerGroupID: parseInt,
  kMDItemFSOwnerUserID: parseInt,
  kMDItemFSSize: parseInt,
  kMDItemFSTypeCode: parseString,
  kMDItemHasAlphaChannel: parseBoolean,
  kMDItemHeadline: parseString,
  kMDItemIdentifier: parseString,
  kMDItemInstantMessageAddresses: parseArrayOfStrings,
  kMDItemInstructions: parseArrayOfStrings,
  kMDItemIsGeneralMIDISequence: parseBoolean,
  kMDItemISOSpeed: parseInt,
  kMDItemKeySignature: parseString,
  kMDItemKeywords: parseArrayOfStrings,
  kMDItemKind: parseString,
  kMDItemLanguages: parseArrayOfStrings,
  kMDItemLastUsedDate: parseDate,
  kMDItemLayerNames: parseArrayOfStrings,
  kMDItemLogicalSize: parseInt,
  kMDItemLyricist: parseString,
  kMDItemMaxAperture: parseFloat,
  kMDItemMediaTypes: parseArrayOfStrings,
  kMDItemMeteringMode: parseString,
  kMDItemMusicalGenre: parseString,
  kMDItemMusicalInstrumentCategory: parseString,
  kMDItemMusicalInstrumentName: parseString,
  kMDItemNamedLocation: parseString,
  kMDItemNumberOfPages: parseInt,
  kMDItemOrganizations: parseArrayOfStrings,
  kMDItemOrientation: parseInt,
  kMDItemPageHeight: parseFloat,
  kMDItemPageWidth: parseFloat,
  kMDItemParticipants: parseArrayOfStrings,
  kMDItemPath: parseString,
  kMDItemPhoneNumbers: parseArrayOfStrings,
  kMDItemPhysicalSize: parseInt,
  kMDItemPixelCount: parseInt,
  kMDItemPixelHeight: parseInt,
  kMDItemPixelWidth: parseInt,
  kMDItemProfileName: parseString,
  kMDItemProjects: parseArrayOfStrings,
  kMDItemPublishers: parseArrayOfStrings,
  kMDItemRecipients: parseArrayOfStrings,
  kMDItemRecipientAddresses: parseArrayOfStrings,
  kMDItemRecordingDate: parseDate,
  kMDItemRecordingYear: parseInt,
  kMDItemRedEyeOnOff: parseBoolean,
  kMDItemResolutionHeightDPI: parseFloat,
  kMDItemResolutionWidthDPI: parseFloat,
  kMDItemRights: parseString,
  kMDItemSecurityMethod: parseString,
  kMDItemStarRating: parseFloat,
  kMDItemStateOrProvince: parseString,
  kMDItemStreamable: parseBoolean,
  kMDItemTempo: parseFloat,
  kMDItemTextContent: parseString,
  kMDItemTimeSignature: parseString,
  kMDItemTitle: parseString,
  kMDItemTotalBitRate: parseFloat,
  kMDItemUseCount: parseInt,
  kMDItemUsedDates: parseArray(parseDate),
  kMDItemUserCreatedDate: parseArray(parseDate),
  kMDItemUserCreatedUserHandle: parseArray((s) => parseInt(s)),
  kMDItemVersion: parseString,
  kMDItemVideoBitRate: parseFloat,
  kMDItemWhereFroms: parseArrayOfStrings,
  kMDItemWhiteBalance: parseInt
};

let searchSpawn = null;

const killPrevSpawn = (search = null) => {
  if (searchSpawn) {
    searchSpawn.kill();
    searchSpawn = null;
  }
  searchSpawn = search;
};

const spotlight = (query, onlyName = true, dir = null, attrs = []) => {
  if (node_process.platform !== "darwin")
    throw new Error(node_process.platform + " is not supported.");
  if ("string" !== typeof query) throw new Error("query must be a string.");
  if (query.length === 0) throw new Error("query must not be empty.");
  if (dir && "string" !== typeof dir) throw new Error("dir must be a string.");

  const args = [query || ".", "-0"];
  if (onlyName) args.unshift("-name");
  if (dir) args.push("-onlyin", dir);
  for (let attr of attrs) args.push("-attr", attr);

  const search = node_child.spawn("mdfind", args, {
    stdio: ["ignore", "pipe", "ignore"]
  });
  killPrevSpawn(search);
  const results = search.stdout
    .pipe(split("\0"))
    .pipe(map.obj((row) => {
      const data = row.toString("utf8").split(/\s+(?=kMD)/);
      const result = {
        path: data[0]
      };

      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        let value = data[i + 1];

        const begin = attr + " = ";
        if (value.slice(0, begin.length) === begin)
          value = value.slice(begin.length);

        if (value === "(null)") value = null;
        else if (attributes[attr]) value = attributes[attr](value);

        result[attr] = value;
      }
      return result;
    }));

  search.on("close", (status) => {
    if (status > 0)
      results.emit("error", new Error("non-zero exit code"));
  });

  return results;
};

window.focus = () => utools.subInputFocus();
window.unfocus = () => utools.subInputBlur();
window.isfocus = false;

window.killMdfind = () => killPrevSpawn();
window.find = (name, onlyName, dir, callback) => {
  new Promise((resolve, reject) => {
    var tempData = [];
    spotlight(name, onlyName, dir, [
      "kMDItemContentType",
      "kMDItemKind",
      "kMDItemFSName",
      "kMDItemFSSize",
      "kMDItemFSNodeCount",
      "kMDItemFSCreationDate",
      "kMDItemFSContentChangeDate",
      "kMDItemLastUsedDate",
      "kMDItemPixelHeight",
      "kMDItemPixelWidth"
    ]).on("data", data => {
      tempData.push(data);
    }).on("end", () => {
      resolve(tempData);
    }).on("error", error => {
      reject(error);
    });
  }).then(result => {
    callback(result);
  }).catch(error => {
    console.log(error);
    callback([]);
  });
};

window.getCurrentFinderPath = callback => {
  new Promise((resolve, reject) => {
    node_child.exec(`osascript -e 'tell application "Finder" to get the POSIX path of (target of front window as alias)'`, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      }
      resolve(stdout);
    });
  }).then(result => {
    callback(result);
  }).catch(error => {
    console.log(error);
    callback([]);
  });
};

window.deleteFile = path => shell.trashItem(path);

window.readTextFile = (path, callback) => {
  var stream = fs.createReadStream(path, {
    flags: "r",
    bufferSize: 512
  })
    .on("data", data => {
      callback(data);
      stream.close();
    });
};

window.readFileList = (path, callback) => {
  var files = fs.readdirSync(path);
  var fileList = [];
  if (files) {
    for (var i = 0; i < files.length; i++) {
      fileList.push({
        name: files[i]
      });
    }
  }
  callback(fileList);
};

window.isDirExists = (path) => {
  return new Promise((resolve) => {
    fs.stat(path, (err, stat) => {
      resolve(err ? false : stat.isDirectory());
    });
  });
};
