# mg-table-template

> a table component with template and stateHook

[![NPM](https://img.shields.io/npm/v/mg-table-template.svg)](https://www.npmjs.com/package/mg-table-template) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save mg-table-template
```

## Usage

```tsx
// Function Component Usage
import React from 'react'
import TableTemplate, from 'mg-table-template'
import 'mg-table-template/dist/index.css'

interface TFilterCondition {
  page:number ; //内置条件参数:页签
  size:number ; //内置条件参数:每页记录数
  mockOther:string ; //示例条件参数:组件使用者可扩展自己需要的条件参数
}

function getUserList(_filterCondition:TFilterCondition){
  return {
    status:1,
    tableData:{
      list:[] ,
      total:0 ,
      page:1 ,
      size:10
    } ,
    msg:"hello"
  } ;
}

async function theFetch(filterCondition:TFilterCondition){ //获取数据
  try{
    const {
      status,
      tableData ,
      msg
    } = await getUserList(filterCondition) ;
    if(status===1){
      return {
        list:tableData.list ,
        total:tableData.total ,
        page:tableData.page ,
        size:filterCondition.size
      }
    }
  }catch(error){
    console.error(error);
  }
  return ;
}

const FunctionComponentDemo = ()=>{
  const [
    tableState,
    tableActions
  ] = useTableState<TFilterCondition>({
    isFetching:false ,
    filterCondition:{
      page:1 ,
      size:10 ,
      mockOther:""
    } ,
    tableData:{
      list:[] ,
      total:0 ,
      page:1 ,
      size:10
    },
    tableConfig:{
      rowKey:"id" ,
      rowSelectionType:"checkbox"
    } ,
    selectedRowKeys:[],
  },theFetch,{
    filterConditionEffectKeys:[] //在此处标记的条件参数改变后会自动触发表格数据的重新获取,如：["mockOther"]
  });

  const {
    updateTableState , //更新表格数据(自动携带条件参数filterCondition并触发theFetch的调用)
    setFilterCondition , //设置条件参数
    // __setSelectedRowKeys__ //非请勿用
  } = tableActions ;

  function handleChangeOfMockOther(e:any){
    const mockOther = e.target.value ;
    setFilterConfition((filterCondition:TFilterCondition)=>{
      return {
        ...filterCondition ,
        mockOther
      }
    });
  }
    
  return (
    <React.Fragment>
      <label>
        模拟一个查询条件字段:
        <input
          value={tableState.filterCondition.mockOther}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={handleChangeOfMockOther}
        />
      </label>
      <button
        // eslint-disable-next-line react/jsx-no-bind
        onClick={updateTableState}
      >
        查询
      </button>
      <TableTemplate<TFilterCondition>
        tableState={tableState}
        tableActions={tableActions}
        tableProps={{
          columns:[
            {
              title:"账号" ,
              dataIndex:"account" ,
              key:"account"
            },
          ]
        }}
      />
    </React.Fragment>
  );
}

export default FunctionComponentDemo ;
```

```tsx
// Class Component Usage
import React from 'react'
import TableTemplate,{useTableState,withTableStateAndActions,TTableStateAndActions} from 'mg-table-template'
import 'mg-table-template/dist/index.css'

interface TFilterCondition {
  page:number ; //内置条件参数:页签
  size:number ; //内置条件参数:每页记录数
  mockOther:string ; //示例条件参数:组件使用者可扩展自己需要的条件参数
}

interface TProps {
  tableStateAndActions?:TTableStateAndActions<TFilterCondition> ;
}

class ClassComponentDemo extends React.Component<TProps ,TState> {
  render () {
    const {
      tableStateAndActions
    } = this.props ;
    return (
      <TableTemplate<TFilterCondition>
        tableState={tableStateAndActions.tableState}
        tableActions={tableStateAndActions.tableActions}
        tableProps={{
          columns:[
            {
              title:"账号" ,
              dataIndex:"account" ,
              key:"account"
            },
          ]
        }}
      />
    ) ;
  }
}

function getUserList(_filterCondition:TFilterCondition){
  return {
    status:1,
    tableData:{
      list:[] ,
      total:0 ,
      page:1 ,
      size:10
    } ,
    msg:"hello"
  } ;
}

async function theFetch(filterCondition:TFilterCondition){ //获取数据
  try{
    const {
      status,
      tableData ,
      msg
    } = await getUserList(filterCondition) ;
    if(status===1){
      return {
        list:tableData.list ,
        total:tableData.total ,
        page:tableData.page ,
        size:filterCondition.size
      }
    }
  }catch(error){
    console.error(error);
  }
  return ;
}

export default withTableStateAndActions<TProps,TFilterCondition>(
  ClassComponentDemo as any,
  (props)=>{
    const [
      tableState,
      tableActions
    ] = useTableState<TFilterCondition>({
      isFetching:false ,
      filterCondition:{
        page:1 ,
        size:10 ,
        mockOther:""
      } ,
      tableData:{
        list:[] ,
        total:0 ,
        page:1 ,
        size:10
      },
      tableConfig:{
        rowKey:"id" ,
        rowSelectionType:"checkbox"
      } ,
      selectedRowKeys:[],
    },theFetch,{
      filterConditionEffectKeys:[] //在此处标记的条件参数改变后会自动触发表格数据的重新获取,如：["mockOther"]
    });
    return {
      tableStateAndActions:[
        tableState ,
        tableActions
      ]
    } ;
  }
)

```

## License

MIT © [maoguy](https://github.com/maoguy)
