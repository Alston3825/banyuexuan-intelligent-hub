export declare const SCORE_MAX = 12;
export declare const SATISFIED_MIN = 10;
export declare const UNSATISFIED_MAX = 6;
export interface SurveyItem {
    key: string;
    label: string;
}
export interface SurveyGroup {
    key: string;
    title: string;
    items: SurveyItem[];
}
export interface TemplateSpec {
    id: string;
    name: string;
    sortNo: number;
    day: number | null;
    goodWord: string;
    badWord: string;
    groups: SurveyGroup[];
    suggestionLabel: string;
    praiseLabel: string;
}
export declare const DEFAULT_TEMPLATES: Omit<TemplateSpec, 'id'>[];
export declare const formItems: (spec: Pick<TemplateSpec, "groups">) => SurveyItem[];
export declare function surveyAiSpec(spec: TemplateSpec): {
    formTitle: string;
    description: string;
    fields: {};
};
export declare function templateImportAiSpec(): {
    formTitle: string;
    description: string;
    fields: {};
};
export declare function normalizeGroups(raw: unknown): SurveyGroup[];
