import NodeCache from "node-cache";

const likeCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export default likeCache;