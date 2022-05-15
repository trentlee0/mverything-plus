/* eslint-disable no-console */
import icons from "./icon";

export default {
  handle(items, highFilter, keyWord, keyMap) {
    if (highFilter !== "") {
      switch (highFilter) {
        // file
        case "f":
          items = items.filter(
            item => item.kMDItemContentType !== "public.folder"
          );
          break;
        // folder
        case "F":
          items = items.filter(
            item => item.kMDItemContentType === "public.folder"
          );
      }
    }

    if (keyWord !== "") {
      let regex = keyMap[keyWord];
      if (regex) {
        items = items.filter(item => {
          let re = RegExp(keyMap[keyWord], "i");
          return item.path.search(re) > 0;
        });
      }
    }

    let data = [];
    let length = items.length;
    for (let i = 0; i < length; i++) {
      let item = items[i];
      if (item === undefined) {
        continue;
      }

      let icon = icons.icon(item);
      data.push({
        path: item.path,
        icon: icon,
        name: item.kMDItemFSName,
        size: item.kMDItemFSSize,
        type: item.kMDItemContentType,
        kind: item.kMDItemKind,
        count: item.kMDItemFSNodeCount,
        createDate: item.kMDItemFSCreationDate,
        updateDate: item.kMDItemFSContentChangeDate,
        usedDate: item.kMDItemLastUsedDate,
        text: "",
        thumbnails: "",
        preview: "",
        files: []
      });
    }

    return data;
  },
  sort(data, field, type) {
    return data.sort(this.sortByField(field, type));
  },
  sortByField(field, type) {
    return (a, b) => {
      let f1 = a[field];
      let f2 = b[field];
      return (f1 < f2 ? 1 : f1 > f2 ? -1 : 0) * type;
    };
  }
};
