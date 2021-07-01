export = MonkeyLearnResponse;
declare function MonkeyLearnResponse(raw_responses: any): void;
declare class MonkeyLearnResponse {
    constructor(raw_responses: any);
    body: any;
    request_queries_used: number;
    plan_queries_allowed: number;
    plan_queries_remaining: number;
    raw_responses: any[];
    _add_raw_response(raw_response: any): void;
}
