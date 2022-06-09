// import {TFilterCondition} from '../index' ;
import React from 'react';
import TableTemplate,{ useTableState } from 'mg-table-template'

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

interface TFilterCondition {
  page:number ;
  size:number ;
  mockOther:string ;
}

const Demo = () => {
  const [
    tableState ,
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
    
  },theFetch) ;

  const {
    updateTableState ,
    setFilterCondition ,
    // __setSelectedRowKeys__ //非请勿用
  } = tableActions ;

  async function theFetch(filterCondition:TFilterCondition){ //获取数据
    console.log("filterCondition:",filterCondition) ;
    try{
      const {
        status,
        tableData ,
        msg
      } = await getUserList(filterCondition) ;
      console.log(msg) ;
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

  function handleChangeOfMockOther(e:any){
    const mockOther = e.target.value ;
    setFilterCondition((filterCondition: any)=>{
      return {
        ...filterCondition ,
        mockOther
      }
    })
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
        mock搜索
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
            {
              title:"用户名" ,
              dataIndex:"useName" ,
              key:"useName"
            },
            {
              title:"角色" ,
              dataIndex:"" ,
              key:""
            },
            {
              title:"最近一次登录时间" ,
              dataIndex:"modifyTime" ,
              key:"modifyTime"
            },
            {
              title:"创建时间",
              dataIndex:"createTime" ,
              key:"createTime"
            },
            {
              title:"操作123" ,
              key:"action" ,
              render:(_text: any,_record: any)=>{
                return (<span>删除</span>)
              }
            }
          ]
        }}
      />
      <pre>
        {JSON.stringify(tableState, null, 2)}
      </pre>
    </React.Fragment>
  ) ;
} ;

export default Demo ;