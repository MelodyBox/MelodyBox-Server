import { _YTMusic } from "./YTMusic";
import { SearchMixin } from "./mixins/search";
import { WatchMixin } from "./mixins/watch";

const YTMusicClient = WatchMixin(SearchMixin(_YTMusic));
export default YTMusicClient;
