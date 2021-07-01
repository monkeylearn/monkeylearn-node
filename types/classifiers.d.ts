export = Classifiers;
declare function Classifiers(ml: any): void;
declare class Classifiers {
  constructor(ml: any);
  tags: Tags;
  // constructor: typeof Classifiers;
  classify: any;
  create(params: any): any;
  edit(model_id: any, params: any): any;
  delete(model_id: any): any;
  deploy(model_id: any): any;
  train(model_id: any): any;
  upload_data(model_id: any, data: any): any;
}
declare function Tags(classifiers: any): void;
declare class Tags {
  constructor(classifiers: any);
  ml: any;
  classifiers: any;
  detail(model_id: any, tag_id: any): any;
  create(model_id: any, params: any): any;
  edit(model_id: any, tag_id: any, params: any): any;
  delete(model_id: any, tag_id: any): any;
}
