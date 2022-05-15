/* eslint-disable no-console */
export default {
  getExtension(name) {
    let index = name.lastIndexOf(".") || 0;
    if (index > 0) {
      return name.substring(index + 1, name.length).toLowerCase();
    }
    return "";
  },
  generateListToMap(list, keyName, valueName) {
    let result = {};
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      result[item[keyName]] = item[valueName];
    }
    return result;
  },
  findIndexInList(list, key, keyName) {
    for (let i = 0; i < list.length; i++) {
      if (key === list[i][keyName]) {
        return i;
      }
    }
    return -1;
  },
  databaseUpdate(settings) {
    if (
      !settings["data"]["databaseVersion"] ||
      settings["data"]["databaseVersion"] < 1
    ) {
      settings["data"]["databaseVersion"] = 1;
      settings["data"]["fileExtension"] = "txt,md,markdown,json,xml,java,py,c,cpp,html,css,vue,ts";
      settings["data"]["pictureExtension"] = "png,jpg,jpeg,bmp,svg,ico";
    }
    if (
      !settings["data"]["databaseVersion"] ||
      settings["data"]["databaseVersion"] < 2
    ) {
      settings["data"]["databaseVersion"] = 2;
    }
    if (
      !settings["data"]["databaseVersion"] ||
      settings["data"]["databaseVersion"] < 3
    ) {
      settings["data"]["databaseVersion"] = 3;
      settings["data"]["videoExtension"] = "mp4,flv";
      settings["data"]["audioExtension"] = "mp3,ogg,wav";
    }
    if (
      !settings["data"]["databaseVersion"] ||
      settings["data"]["databaseVersion"] < 4
    ) {
      settings["data"]["databaseVersion"] = 4;
      settings["data"]["isAutoSearch"] = true;
      settings["data"]["isShowTempDirAllFiles"] = true;
      settings["data"]["isUseSystemFileIcon"] = true;
      settings["data"]["isShowDetailPage"] = true;
    }
    console.log("database update finish:", settings);
    return settings;
  }
};
