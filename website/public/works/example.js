
// 前面可空行

//@part-begin:whole
//@part-begin:rule
// 简单分形算法
let productionRule = {
  '0': ['4', '5', '2'],
  '1': ['6', '3', '4'],
  '2': ['0', '3', '6'],
  '3': ['5', '0', '4'],
  '4': ['2', '3', '6'],
  '5': ['0', '3', '2'],
  '6': ['3', '1', '4']
}
//@part-end

//@part-begin:iter
export function iter(count, noteList, seedList) {
  if (count <= 0) {
    return noteList.concat(seedList)
  }

  let newSeedList = seedList.map(x=>productionRule[x]).flat()
  let newNoteList = noteList.concat(seedList)
  return iter(count - 1, newNoteList, newSeedList)
}
//试试啊
//@part-end
//@part-end


