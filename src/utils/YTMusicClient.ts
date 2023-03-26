import { z } from "zod";

// Searchs
const SearchOptions = z.object({
  query: z.string().min(1),
  filter: z.string().optional(),
  scope: z.string().optional(),
  limit: z.number().default(20),
  ignore_spelling: z.boolean().default(false),
});
type SearchOptions = z.infer<typeof SearchOptions>;
const SearchParams = SearchOptions.partial().required({ query: true });
type SearchParams = z.infer<typeof SearchParams>;

export class YTMusicClient {
  constructor() {
    void 0;
  }

  async search(options: SearchParams) {
    const safeOptions = SearchOptions.parse(options);
    console.log(safeOptions);
  }
}
