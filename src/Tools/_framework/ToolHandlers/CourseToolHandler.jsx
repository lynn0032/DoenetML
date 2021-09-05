import React, { useState } from 'react';
import { 
  atom, 
  selector, 
  atomFamily,
  selectorFamily,
  useRecoilCallback
 } from 'recoil'
import axios from "axios";
import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useToast, toastType } from '@Toast';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExternalLinkAlt
 } from '@fortawesome/free-solid-svg-icons';

 import { 
  faClipboard
 } from '@fortawesome/free-regular-svg-icons';

import { nanoid } from 'nanoid';

import {fetchDrivesQuery, folderDictionaryFilterSelector, loadAssignmentSelector} from '../../../_reactComponents/Drive/NewDrive';
import Button from '../../../_reactComponents/PanelHeaderComponents/Button';
import ButtonGroup from '../../../_reactComponents/PanelHeaderComponents/ButtonGroup';


const formatDate = (dt) => {
  const formattedDate = `${
    dt.getFullYear().toString().padStart(2, '0')}-${
    (dt.getMonth()+1).toString().padStart(2, '0')}-${
    dt.getDate().toString().padStart(2, '0')} ${
    dt.getHours().toString().padStart(2, '0')}:${
    dt.getMinutes().toString().padStart(2, '0')}:${
    dt.getSeconds().toString().padStart(2, '0')}`;
    
  return formattedDate;
}
const formatFutureDate = (dt) => {
  const formattedFutureDate = `${
    dt.getFullYear().toString().padStart(2, '0')}-${
    (dt.getMonth()+1).toString().padStart(2, '0')}-${
    (dt.getDate()).toString().padStart(2, '0')} ${
    dt.getHours().toString().padStart(2, '0')}:${
    dt.getMinutes().toString().padStart(2, '0')}:${
    dt.getSeconds().toString().padStart(2, '0')}`;
    
  return formattedFutureDate;
}

export const useAssignment = () => {
  const addToast = useToast();

  const addContentAssignment = useRecoilCallback(
    ({  set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId ,contentId,versionId,doenetId } = props;
      const dt = new Date();
      const ndt = new Date(new Date().getTime()+(5*24*60*60*1000));
      const creationDate = formatDate(dt);
      const futureDueDate = formatFutureDate(ndt);
      // assignment creation
      let newAssignmentObj = {
        assignedDate: creationDate,
        attemptAggregation: 'm',
        dueDate: futureDueDate,
        gradeCategory: 'l',
        individualize: '0',
        isAssigned: '1',
        isPublished: '0',
        itemId: driveIditemIddoenetIdparentFolderId.itemId,
        versionId:versionId,
        contentId: contentId,
        multipleAttempts: '0',
        numberOfAttemptsAllowed: '2',
        proctorMakesAvailable: '0',
        showCorrectness: '1',
        showFeedback: '1',
        showHints: '1',
        showSolution: '1',
        timeLimit: null,
        totalPointsOrPercent: '00.00',
        assignment_isPublished: '0',
        subType: 'Administrator',
      };
      let newchangedAssignmentObj = {
        assignedDate: creationDate,
        attemptAggregation: 'm',
        dueDate: futureDueDate,
        gradeCategory: 'l',
        individualize: false,
        isAssigned: '1',
        isPublished: '0',
        contentId:contentId,
        itemId: driveIditemIddoenetIdparentFolderId.itemId,
        versionId:versionId,
        multipleAttempts: false,
        numberOfAttemptsAllowed: '2',
        proctorMakesAvailable: false,
        showCorrectness: true,
        showFeedback: true,
        showHints: true,
        showSolution: true,
        timeLimit: null,
        totalPointsOrPercent: '100',
        assignment_isPublished: '0',
      };

      let payload = {
        ...newAssignmentObj,
        driveId: driveIditemIddoenetIdparentFolderId.driveId,
        itemId: driveIditemIddoenetIdparentFolderId.itemId,
        doenetId: doenetId,
        contentId: contentId,
      };
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), newchangedAssignmentObj);

      let result = await axios.post(`/api/makeNewAssignment.php`, payload).catch((e) =>{return {data:{message:e, success:false}}})
     try {
        if(result.data.success){
          return result.data;
        }     
      else{
        return  {message:result.data.message, success:false};
      }
     } catch (e) {
      return {message:e, success:false};
     }
    },
  );

  const addSwitchAssignment = useRecoilCallback(
    ({  set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId ,contentId,versionId,doenetId, ...rest } = props;
      const formatFutureDate = (dt) => {
        const formattedFutureDate = `${
          dt.getFullYear().toString().padStart(2, '0')}-${
          (dt.getMonth()+1).toString().padStart(2, '0')}-${
          (dt.getDate()).toString().padStart(2, '0')} ${
          dt.getHours().toString().padStart(2, '0')}:${
          dt.getMinutes().toString().padStart(2, '0')}:${
          dt.getSeconds().toString().padStart(2, '0')}`;
          
        return formattedFutureDate;
      }
      const dt = new Date();
      const creationDate = formatDate(dt);
      const ndt = new Date(new Date().getTime()+(5*24*60*60*1000));
      const futureDueDate = formatFutureDate(ndt);
      let newAssignmentObj = {
        assignedDate: rest.assignedDate ? rest.assignedDate : creationDate,
        attemptAggregation: rest.attemptAggregation ? rest.attemptAggregation : 'm',
        dueDate: rest.dueDate ? rest.dueDate : futureDueDate,
        gradeCategory: rest.gradeCategory ? rest.gradeCategory :'l',
        individualize: rest.individualize ? rest.individualize : '0',
        isAssigned: rest.isAssigned ? rest.isAssigned : '1',
        isPublished: rest.isPublished ?rest.isPublished : '0',
        contentId:contentId,
        itemId: driveIditemIddoenetIdparentFolderId.itemId,
        versionId:versionId,
        multipleAttempts: rest.multipleAttempts ? rest.multipleAttempts : '0',
        numberOfAttemptsAllowed: rest.numberOfAttemptsAllowed ?rest.numberOfAttemptsAllowed : '2',
        proctorMakesAvailable: rest.proctorMakesAvailable ? rest.proctorMakesAvailable : '2',
        showCorrectness: rest.showCorrectness ? rest.showCorrectness : '1',
        showFeedback: rest.showFeedback ? rest.showFeedback : '1',
        showHints: rest.showHints ? rest.showHints : '1',
        showSolution: rest.showSolution ? rest.showSolution : '1',
        timeLimit: rest.timeLimit ? rest.timeLimit : '10:10',
        totalPointsOrPercent: rest.totalPointsOrPercent ? rest.totalPointsOrPercent : '00.00' ,
        subType: 'Administrator',
      };
      let newchangedAssignmentObj = {
        assignedDate: rest.assignedDate ? rest.assignedDate : creationDate,
        attemptAggregation: rest.attemptAggregation ? rest.attemptAggregation : 'e',
        dueDate: rest.dueDate ? rest.dueDate : futureDueDate,
        gradeCategory: rest.gradeCategory ? rest.gradeCategory :'l',
        individualize: rest.individualize ? rest.individualize : false,
        isAssigned: rest.isAssigned ? rest.isAssigned : '1',
        isPublished: rest.isPublished ?rest.isPublished : '0',
        contentId:contentId,
        itemId: driveIditemIddoenetIdparentFolderId.itemId,
        versionId:versionId,
        multipleAttempts: rest.multipleAttempts ? rest.multipleAttempts : false,
        numberOfAttemptsAllowed: rest.numberOfAttemptsAllowed ?rest.numberOfAttemptsAllowed : '2',
        proctorMakesAvailable: rest.proctorMakesAvailable ? rest.proctorMakesAvailable : false,
        showCorrectness: rest.showCorrectness ? rest.showCorrectness : true,
        showFeedback: rest.showFeedback ? rest.showFeedback : true,
        showHints: rest.showHints ? rest.showHints : true,
        showSolution: rest.showSolution ? rest.showSolution : true,
        timeLimit: rest.timeLimit ? rest.timeLimit : '10:10',
        totalPointsOrPercent: rest.totalPointsOrPercent ? rest.totalPointsOrPercent : '00.00' ,
        subType: 'Administrator',
      };

      let payload = {
        ...newAssignmentObj,
        driveId: driveIditemIddoenetIdparentFolderId.driveId,
        itemId: driveIditemIddoenetIdparentFolderId.itemId,
        doenetId: doenetId,
        contentId: contentId,
      };
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), newchangedAssignmentObj);

      let result = await axios.post(`/api/makeNewAssignment.php`, payload).catch((e) =>{return {data:{message:e, success:false}}})
     try {
        if(result.data.success){
          return result.data;
        }     
      else{
        return  {message:result.data.message, success:false};
      }
     } catch (e) {
      return {message:e, success:false};
     }
    },
  );

  const updateVersionHistory = useRecoilCallback(({set})=> async (doenetId,versionId,isAssigned)=>{
    // console.log(">>>",{doenetId,versionId,newTitle})
      set(itemHistoryAtom(doenetId),(was)=>{
        let newHistory = {...was}
        newHistory.named = [...was.named];
        let newVersion;
        for (const [i,version] of newHistory.named.entries()){
          if (versionId === version.versionId){
            newVersion = {...version}
            newVersion.isAssigned = isAssigned;
            newHistory.named.splice(i,1,newVersion)
          }
        }
        
        return newHistory;
      })
  return versionId;
    });
    const updatePrevVersionHistory = useRecoilCallback(({set})=> async (doenetId,versionId)=>{
      // console.log(">>>",{doenetId,versionId,newTitle})
        set(itemHistoryAtom(doenetId),(was)=>{
          let newHistory = {...was}
          newHistory.named = [...was.named];
          let newVersion;
          for (const [i,version] of newHistory.named.entries()){
            if (versionId === version.versionId){
              newVersion = {...version}
              newVersion.isAssigned = 0;
              newHistory.named.splice(i,1,newVersion)
            }
          }
          const payload ={
            versionId:versionId
          }
          const result = axios.post('/api/switchVersionUpdate.php', payload)
          result.then(resp => {
            if (resp.data.success){
              return resp.data;
            }
          });
          
          return newHistory;
        })
    
      });
  const changeSettings = useRecoilCallback(
    ({  set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId, ...value } = props;
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), (old) => {
        return { ...old, ...value };
      });
    },
  );

  const saveSettings = useRecoilCallback(
    ({ snapshot, set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId, ...value } = props;

      const saveInfo = await snapshot.getPromise(assignmentDictionary(driveIditemIddoenetIdparentFolderId));

      // set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), (old) => {
      //   return { ...old, ...value, ...driveIditemIddoenetIdparentFolderId };
      // });
      let saveAssignmentNew = { ...saveInfo, ...value };
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), saveAssignmentNew);
      const payload = {
        ...saveAssignmentNew,
        doenetId: driveIditemIddoenetIdparentFolderId.doenetId,
        contenId:driveIditemIddoenetIdparentFolderId.contenId,
        versionId:driveIditemIddoenetIdparentFolderId.versionId,
        driveId:driveIditemIddoenetIdparentFolderId.driveId
      };

      const result = axios.post('/api/saveAssignmentToDraft.php', payload)
      result.then(resp => {
        if (resp.data.success){
          return resp.data;
        }
      });
     return result;
    },
  );

  const publishContentAssignment = useRecoilCallback(
    ({ snapshot, set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId, ...value } = props;
      const publishAssignment = await snapshot.getPromise(assignmentDictionary(driveIditemIddoenetIdparentFolderId));

      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId),publishAssignment
      );
      const payloadPublish = {
        ...value,
        doenetId: props.doenetId,
        contentId:props.contentId
      };
      const result = axios.post('/api/publishAssignment.php', payloadPublish)
      result.then(resp => {
        if (resp.data.success){
          return resp.data;
        }
      });
     return result;
    },
  );

  const updateexistingAssignment = useRecoilCallback(
    ({  get,set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId, ...value } = props;
      let editAssignment = get(assignmentDictionary);
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), editAssignment);
    },
  );

  const assignmentToContent = useRecoilCallback(({ snapshot, set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId, ...value } = props;
      const handlebackContent = await snapshot.getPromise(assignmentDictionary(driveIditemIddoenetIdparentFolderId));
      const payloadContent = { ...handlebackContent, isAssigned: 0 };
     
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), payloadContent);

      set(itemHistoryAtom(driveIditemIddoenetIdparentFolderId.doenetId),(was)=>{
        let newHistory = {...was}
        newHistory.named = [...was.named];
        let newVersion;
        for (const [i,version] of newHistory.named.entries()){
          if (driveIditemIddoenetIdparentFolderId.versionId === version.versionId){
            newVersion = {...version}
            newVersion.isAssigned = 0;
            newHistory.named.splice(i,1,newVersion)
          }
        }
        
        return newHistory;
      })
    },

  );
  const loadAvailableAssignment = useRecoilCallback(({ snapshot, set }) => async (props) => {
      let { driveIditemIddoenetIdparentFolderId, ...value } = props;
      const handlebackAssignment = await snapshot.getPromise(assignmentDictionary(driveIditemIddoenetIdparentFolderId));
      const payloadAssignment = { ...handlebackAssignment, isAssigned: 1 };
      set(assignmentDictionary(driveIditemIddoenetIdparentFolderId), payloadAssignment);
    },
  );

  const onAssignmentError = ({ errorMessage = null }) => {
    addToast(`${errorMessage}`, toastType.ERROR);
  };
  return {
    addContentAssignment,
    addSwitchAssignment,
    updateVersionHistory,
    updatePrevVersionHistory,
    changeSettings,
    saveSettings,
    publishContentAssignment,
    updateexistingAssignment,
    assignmentToContent,
    loadAvailableAssignment,
    onAssignmentError,
  };
};


export const itemHistoryAtom = atomFamily({
  key:"itemHistoryAtom",
  default: selectorFamily({
    key:"itemHistoryAtom/Default",
    get:(doenetId)=> async ()=>{
      let draft = {};
      let named = [];
      let autoSaves = [];
      if (!doenetId){
        return {draft,named,autoSaves};
      }
      const { data } = await axios.get(
        `/api/loadVersions.php?doenetId=${doenetId}`
      );
        
      draft = data.versions[0];
      for (let version of data.versions){
        if (version.isDraft === '1'){
          continue;
        }
        if (version.isNamed === '1'){
          named.push(version);
          continue;
        }
        autoSaves.push(version);
      }
      return {draft,named,autoSaves};

    }
  })
})

export const fileByContentId = atomFamily({
  key:"fileByContentId",
  default: selectorFamily({
    key:"fileByContentId/Default",
    get:(contentId)=> async ()=>{
      if (!contentId){
        return "";
      }
      // const local = localStorage.getItem(contentId);
      // if (local){ return local}
      try {
        const server = await axios.get(`/media/${contentId}.doenet`); 
        return server.data;
      } catch (error) {
        //TODO: Handle 404
        // Error 😨
        if (error.response) {
          /*
          * The request was made and the server responded with a
          * status code that falls out of the range of 2xx
          */
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
            /*
            * The request was made but no response was received, `error.request`
            * is an instance of XMLHttpRequest in the browser and an instance
            * of http.ClientRequest in Node.js
            */
            console.log(error.request);
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
              return "Error Loading";
        }
    }
  })
  
})

export const drivecardSelectedNodesAtom = atom({
  key:'drivecardSelectedNodesAtom',
  default:[]
})

export const assignmentDictionary = atomFamily({
  key: 'assignmentDictionary',
  default: selectorFamily({
    key: 'assignmentDictionary/Default',
    get:
      (driveIditemIddoenetIdparentFolderId) =>
      async ({ get }, instructions) => {
        let folderInfoQueryKey = {
          driveId: driveIditemIddoenetIdparentFolderId.driveId,
          folderId: driveIditemIddoenetIdparentFolderId.folderId,
        };
        // let folderInfo = get(
        //   folderDictionaryFilterSelector(folderInfoQueryKey),
        // );
        // const itemObj =
        //   folderInfo?.contentsDictionary?.[
        //     driveIditemIddoenetIdparentFolderId.itemId
        //   ];
        if (driveIditemIddoenetIdparentFolderId.doenetId) {
          const aInfo = await get(
            loadAssignmentSelector(
              driveIditemIddoenetIdparentFolderId.doenetId,
            ),
          );
          if (aInfo) {
            return aInfo;
          } else return null;
        } else return null;
      },
  }),
});
export let assignmentDictionarySelector = selectorFamily({
  key: 'assignmentDictionarySelector',
  get:
    (driveIditemIddoenetIdparentFolderId) =>
    ({ get }) => {
      return get(assignmentDictionary(driveIditemIddoenetIdparentFolderId));
    },
});

export const variantInfoAtom = atom({
  key:"variantInfoAtom",
  default:{index:null,name:null,lastUpdatedIndexOrName:null,requestedVariant:{index:1}}
})

export const variantPanelAtom = atom({
  key:"variantPanelAtom",
  default:{index:null,name:null}
})

export function buildTimestamp(){
  const dt = new Date();
  return `${
    dt.getFullYear().toString().padStart(2, '0')}-${
    (dt.getMonth()+1).toString().padStart(2, '0')}-${
    dt.getDate().toString().padStart(2, '0')} ${
    dt.getHours().toString().padStart(2, '0')}:${
    dt.getMinutes().toString().padStart(2, '0')}:${
    dt.getSeconds().toString().padStart(2, '0')}`
}

export const getSHAofContent = (doenetML)=>{
  if (doenetML === undefined){
    return;
  }
  //NOTICE: JSON.stringify CHANGES THE CONTENT SO IT DOESN'T MATCH
  // let contentId = sha256(JSON.stringify(doenetML)).toString(CryptoJS.enc.Hex);
  let contentId = sha256(doenetML).toString(CryptoJS.enc.Hex);
  return contentId;
}

export function ClipboardLinkButtons(props){
  const addToast = useToast();
  let link = `http://localhost/#/content?doenetId=${props.doenetId}`

  if (props.contentId){
    link = `http://localhost/#/content?contentId=${props.contentId}`
  }


  let linkData = []
  if(props.contentId) {
    linkData.push(`contentId=${props.contentId}`);
  }
  if(props.doenetId) {
    linkData.push(`doenetId=${props.doenetId}`);
  }
  let embedLink = `<copy uri="doenet:${linkData.join('&')} />`


  // if (!props.contentId){
  //   console.error("Component only handles contentId at this point")
  //   return null;
  // }
  

  // const link = `http://${window.location.host}/content/#/?contentId=${props.contentId}`
  return <div> 
    <ButtonGroup>
  <CopyToClipboard onCopy={()=>addToast('Link copied to clipboard!', toastType.SUCCESS)} text={link}>
  {/* <button>copy link <FontAwesomeIcon icon={faClipboard}/></button>  */}
  <Button disabled={props.disabled} icon={<FontAwesomeIcon icon={faClipboard}/>} value="copy link" />
  </CopyToClipboard>

  <CopyToClipboard onCopy={()=>addToast('Embed link copied to clipboard!', toastType.SUCCESS)} text={embedLink}>
  <Button disabled={props.disabled} icon={<FontAwesomeIcon icon={faClipboard}/>} value="copy embed link" />
  </CopyToClipboard>

  <Button 
  icon = {<FontAwesomeIcon icon={faExternalLinkAlt}/>}
  value = "visit"
  disabled={props.disabled} 
  onClick={
    ()=>window.open(link, '_blank')
  } /> 
</ButtonGroup>
  {/* <button onClick={
    ()=>window.open(link, '_blank')
  }>visit <FontAwesomeIcon icon={faExternalLinkAlt}/></button> */}
  </div>
}

export function RenameVersionControl(props){
  let [textFieldFlag,setTextFieldFlag] = useState(false);
  let [currentTitle,setCurrentTitle] = useState(props.title);

  const renameVersion = useRecoilCallback(({set})=> async (doenetId,versionId,newTitle)=>{
    // console.log(">>>",{doenetId,versionId,newTitle})
      set(itemHistoryAtom(doenetId),(was)=>{
        let newHistory = {...was}
        newHistory.named = [...was.named];
        let newVersion;
        for (const [i,version] of newHistory.named.entries()){
          if (versionId === version.versionId){
            newVersion = {...version}
            newVersion.title = newTitle;
            newHistory.named.splice(i,1,newVersion)
          }
        }
        let newDBVersion = {...newVersion,
          isNewTitle:'1',
          doenetId
        }
           axios.post("/api/saveNewVersion.php",newDBVersion)
            // .then((resp)=>{console.log(">>>resp saveNamedVersion",resp.data)})
        return newHistory;
      })
  
    });

    function renameIfChanged(){
      setTextFieldFlag(false)
      if (props.title !== currentTitle){
        renameVersion(props.doenetId,props.versionId,currentTitle);
      }
    }

    if (!textFieldFlag){
      return <Button disabled={props.disabled} onClick={()=>setTextFieldFlag(true)} value="Rename" />
    }
  return <input type='text' autoFocus value={currentTitle} 
  onChange={(e)=>{setCurrentTitle(e.target.value)}}
  onKeyDown={(e)=>{
    if (e.key === 'Enter'){
    renameIfChanged();
  }}}
  onBlur={()=>{
    renameIfChanged();
  }}
  />

}