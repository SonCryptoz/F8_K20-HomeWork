// Hàm xử lý logic
const analyzeValue = (value) => {
    return { 
        input: value, // giá trị ban đầu truyền vào
        type: typeof value, // kết quả của typeof value
        isTruthy: !!value, // hoặc dùng Boolean(value)
        isNullOrUndefined: value === null || typeof value === "undefined", // có phải null hoặc undefined không (boolean)
        isReferenceType:
            value !== null &&
            (typeof value === "object" || typeof value === "function"), //  có phải object thật sự hoặc function không, không tính null (boolean)
    };
};

const typeNull = analyzeValue(null);
console.log(typeNull);
// {
//   input: null,
//   type: "object",
//   isTruthy: false,
//   isNullOrUndefined: true,
//   isReferenceType: false
// }

const typeUndefined = analyzeValue(undefined);
console.log(typeUndefined);
// {
//   input: undefined,
//   type: "undefined",
//   isTruthy: false,
//   isNullOrUndefined: true,
//   isReferenceType: false
// }

const typeNumber = analyzeValue(0);
console.log(typeNumber);
// {
//   input: 0,
//   type: "number",
//   isTruthy: false,
//   isNullOrUndefined: false,
//   isReferenceType: false
// }

const typeString = analyzeValue("hello");
console.log(typeString);
// {
//   input: "hello",
//   type: "string",
//   isTruthy: true,
//   isNullOrUndefined: false,
//   isReferenceType: false
// }

const typeArray = analyzeValue([1, 2, 3]);
console.log(typeArray);
// {
//   input: [1, 2, 3],
//   type: "object",
//   isTruthy: true,
//   isNullOrUndefined: false,
//   isReferenceType: true
// }

const typeObject = analyzeValue({});
console.log(typeObject);
// {
//   input: {},
//   type: "object",
//   isTruthy: true,
//   isNullOrUndefined: false,
//   isReferenceType: true
// }

const typeFunction = analyzeValue(function () {});
console.log(typeFunction);
// {
//   input: [Function],
//   type: "function",
//   isTruthy: true,
//   isNullOrUndefined: false,
//   isReferenceType: true
// }

const typeNumberNaN = analyzeValue(NaN);
console.log(typeNumberNaN);
// {
//   input: NaN,
//   type: "number",
//   isTruthy: false,
//   isNullOrUndefined: false,
//   isReferenceType: false
// }
