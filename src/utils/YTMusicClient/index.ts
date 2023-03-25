import { _YTMusicClient } from "./YTMusicClient";
import { SearchMixin } from "./mixins/search";

const YTMusicClient = SearchMixin(_YTMusicClient);
// let x = new YTMusicClient();
// x

export default YTMusicClient;
