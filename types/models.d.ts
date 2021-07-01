export = Models;
declare function Models(ml: any, base_url: any): void;
declare class Models {
    constructor(ml: any, base_url: any);
    ml: any;
    base_url: any;
    run_action: string;
    run(model_id: any, data: any, params: any): any;
    detail(model_id: any): any;
    list(params: any): any;
}
