export function validateMarketReport(data: any) {
    if (!data || typeof data !== 'object') throw new Error("Invalid report data returned by AI");
    if (!data.executive_summary) throw new Error("Missing executive_summary in AI response");
    if (!data.market_size || !data.market_size.tam) throw new Error("Missing market_size or tam in AI response");
    return true;
}
