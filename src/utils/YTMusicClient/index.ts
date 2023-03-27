import { _YTMusic } from "./YTMusic";
import { SearchMixin } from "./mixins/search";

const YTMusicClient = SearchMixin(_YTMusic);
export default YTMusicClient;
