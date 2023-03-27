import { _YTMusic } from "./YTMusic";
import { SearchMixin } from "./mixins/search";
import { WatchMixin } from "./mixins/watch";
import { BrowseMixin } from "./mixins/browse";

const YTMusicClient = BrowseMixin(WatchMixin(SearchMixin(_YTMusic)));
export default YTMusicClient;
