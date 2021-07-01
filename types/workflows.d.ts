export = Workflows;
declare function Workflows(ml: any): void;
declare class Workflows {
  constructor(ml: any);
  steps: WorkflowSteps;
  data: WorkflowData;
  custom_fields: WorkflowCustomFields;
  // constructor: typeof Workflows;
  run: any;
  list: any;
  create(params: any): any;
  delete(model_id: any): any;
}
declare function WorkflowSteps(workflows: any): void;
declare class WorkflowSteps {
  constructor(workflows: any);
  ml: any;
  workflows: any;
  create(model_id: any, params: any): any;
}
declare function WorkflowData(workflows: any): void;
declare class WorkflowData {
  constructor(workflows: any);
  ml: any;
  workflows: any;
  create(model_id: any, data: any): any;
  list(model_id: any, params: any): any;
}
declare function WorkflowCustomFields(workflows: any): void;
declare class WorkflowCustomFields {
  constructor(workflows: any);
  ml: any;
  workflows: any;
  create(model_id: any, params: any): any;
}
