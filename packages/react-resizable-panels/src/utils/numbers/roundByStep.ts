export const roundByStep=({number,step,minSize=1,maxSize=100}:{number:number,step:number,minSize?:number,maxSize?:number})=>{
  
    const preparedStep=Math.max(Math.min(step,maxSize),minSize)
    return Math.round(number/preparedStep)*step
}
