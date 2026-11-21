export interface MatchableItem {
    name: string;
    spec?: string | null;
    brand?: string | null;
    code?: string | null;
    category?: string | null;
}
export declare function itemMatchesKeyword(item: MatchableItem, keyword: string | undefined | null): boolean;
