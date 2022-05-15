/* eslint-disable no-console */
/* eslint-disable no-undef */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    settings: {
      _id: "setting",
      data: {
        databaseVersion: 1,
        isFindFileContent: false,
        searchRoot: "user",
        searchKey: ":",
        keyList: [
          {
            "key": "excel",
            "regex": "\\.xls$|\\.xlsx$|\\.csv$"
          },
          {
            "key": "word",
            "regex": "\\.doc$|\\.docx$"
          },
          {
            "key": "ppt",
            "regex": "\\.ppt$|\\.pptx$"
          },
          {
            "key": "zip",
            "regex": "\\.zip$|\\.rar$|\\.7z$|\\.gz$|\\.bz2$|\\.tar.gz$|\\.tar.bz2$"
          }
        ],
        fileExtension: "txt,md,markdown,json,xml,java,py,c,cpp,html,css,vue,ts",
        pictureExtension: "png,jpg,jpeg,bmp,svg,ico",
        videoExtension: "mp4,flv",
        audioExtension: "mp3,ogg,wav",
        isAutoSearch: true,
        isShowTempDirAllFiles: true,
        isUseSystemFileIcon: true,
        isShowDetailPage: true
      },
      _rev: ""
    }
  },
  getters: {
    settings(state) {
      console.log("setting getter");
      let settings = state.settings;
      if (settings._rev === "") {
        console.log("rev is empty");
        let result = utools.db.get(settings._id);
        console.log("db result:", result);
        if (result) {
          settings = result;
          store.commit("updateSettings", settings);
        }
      }
      return settings;
    }
  },
  mutations: {
    updateSettings(state, settings) {
      console.log("update settings", settings);
      state.settings = settings;
    },
    updateSettingsRev(state, rev) {
      console.log("update rev:", rev);
      state.settings._rev = rev;
    },
    updateSettingsKeyList(state, keyList) {
      console.log("update keyList:", keyList);
      state.settings.data.keyList = keyList;
    }
  }
});

export default store;
