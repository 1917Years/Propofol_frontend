import { React, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import axios from "axios";
import { SERVER_URL } from "../utils/SRC";
import "react-quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
//import EditorToolbar, { modules, formats } from "./EditorToolbar";

//dangerouslySetInnerHTML 나중에 추가하기
function BlogEditor(props) {
  const [htmlContent, setHtmlContent] = useState("");
  let prevTitle = "";
  let prevContent = "";
  const quillRef = useRef();
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(true);
  const [writingInfo, setWritingInfo] = useState({ "title": null, "detail": null });
  const [baseUrlList, setBaseUrlList] = useState([]);
  const [imgFileList, setImgFileList] = useState([]);
  const [imgList, setImgList] = useState([]);
  const [imgUrlList, setImgUrlList] = useState([]);
  const [imgNameList, setImgNameList] = useState([]);
  const [codeInput, setCodeInput] = useState("");
  const [language, setLanguage] = useState("");
  /* 커스텀 툴바 */
  const formData = new FormData();

  const navigate = useNavigate();

  function imageHandler() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      let fileReader = new FileReader();
      let imgsrc;
      let tmpImgList = imgFileList;
      const file = input.files[0];
      imgFileList.push(file);
      setImgFileList(tmpImgList);
      //formData.append('file', file);
      const range = quillRef.current.getEditor().getSelection();
      fileReader.readAsDataURL(file);
      fileReader.onload = function (evt) { //임시로 프론트에 이미지 띄워줌
        let tmpBaseList = baseUrlList;
        imgsrc = evt.target.result;
        tmpBaseList.push(imgsrc);
        setBaseUrlList(tmpBaseList);
        console.log(file);
        quillRef.current.getEditor().insertEmbed(range.index, "image", imgsrc);
        //
        console.log("헤위~");
        console.log(quillRef);
        let quill = quillRef.current?.getEditor();
        quill?.clipboard.dangerouslyPasteHTML(5, '&nbsp;<b>World</b>');
        //
      }
      /*
      try {
        const result = await axios.post(SERVER_URL + '/til-service/api/v1/boards/image', formData);
        console.log(result);
        const IMG_URL = result.data.data; //일케하면되니?
        let NEW_IMG_URL = IMG_URL.toString().replace("http://localhost:8000", SERVER_URL);
        console.log("유알엘 : " + NEW_IMG_URL);
        quillRef.current.getEditor().insertEmbed(range.index, "image", NEW_IMG_URL);
        quillRef.current.getEditor().setSelection(range.index + 1);
      } catch (e) {
        quillRef.current.getEditor().deleteText(range.index, 1);
      }
      */
    };
    console.log("폼데이터 : 시발 왜 안떠!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(formData.get('file'));
  }

  useState(() => {
    console.log("로드 결과는~");
    console.log(props.loadWritingInfo);
    if (props.isModify && (props.loadWritingInfo != null)) {
      console.log("하이루");
      console.log(props.loadWritingInfo.detail);
      prevTitle = props.loadWritingInfo.title;
      prevContent = props.loadWritingInfo.detail;
      /*
      console.log(quillRef);
      const range = quillRef.current?.getEditor().getSelection()?.index;
      let quill = quillRef.current?.getEditor();
      quill?.clipboard.dangerouslyPasteHTML(5, '&nbsp;<b>World</b>');
      */
    }
  }, [])

  useState(() => {
    console.log("prevCon은");
    console.log(prevContent);
  }, [prevContent])
  const CustomTmpSave = () => {
    return (
      <button class="z-40 w-[5rem] rounded-[18px] bg-none border border-gray-400 text-gray-600 font-sbtest px-5 py-1 flex bg-white items-center gap-2">
        <div class="text-center">임시저장</div>
        <div class="h-3/5 w-1 border-l border-gray-400"></div>
        <div class="text-center text-gray-600 font-ltest">0</div>
      </button>
    );
  };

  let FontAttributor = Quill.import("attributors/class/font");
  FontAttributor.whitelist = [
    "iroBatang",
    "nanumGothic",
    "nanumMyeongjo",
    "maruBuri",
    "nanumPen",
    "nanumSquare",
    "tvn",
  ];
  Quill.register(FontAttributor, true);

  let Size = Quill.import("attributors/style/size");
  Size.whitelist = [
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "22px",
    "24px",
    "26px",
    "28px",
    "30px",
    "36px",
    "48px",
    "60px",
  ];
  Quill.register(Size, true);

  hljs.configure({
    languages: ["javascript", "ruby", "python", "c", "c++", "java"],
  });


  /*
  const modules = useMemo(() => ({
    toolbar: {
      container: "#toolbar",
      handlers: {
        image: imageHandler
      }
    },
    syntax: {
      highlight: (text) => hljs.highlightAuto(text).value,
    },
  }),
    []
  );
*/

  useEffect(() => {
    console.log(codeInput);
    console.log(language);
  }, [codeInput, language])

  const modules = {
    clipboard: {
      matchers: [

      ]
    },
    toolbar: {
      container: "#toolbar",
      handlers: {
        image: imageHandler
      }
    },
    syntax: {
      //onChange: (text) => setCodeInput(text),
      //attach: (text) => setCodeInput(text),
      //initTimer: (text) => setCodeInput(text),
      value: (text) => hljs.highlightAuto(text).language,
      highlight: (text) => {
        setCodeInput(text);
        setLanguage(hljs.highlightAuto(text).language);
        return (hljs.highlightAuto(text).value);
      }
      //language: (text) => hljs.highlightAuto(text).language
    },
  };

  function EditorToolbar() {
    //Custom Toolbar
    return (
      <div
        id="toolbar"
        class="flex w-full min-w-[100rem] bg-gray-50 h-12 fixed z-40 gap-[1px]"
      >
        <span className="ql-formats mt-1 ml-3">
          <select className="ql-font" defaultValue="iroBatang">
            <option value="iroBatang" selected>
              이롭게 바탕체
            </option>
            <option value="nanumGothic">나눔고딕</option>
            <option value="nanumMyeongjo">나눔명조</option>
            <option value="nanumPen">나눔손글씨 펜</option>
            <option value="nanumSquare">나눔스퀘어</option>
            <option value="maruBuri">마루 부리</option>
            <option value="tvn">tvn 즐거운 이야기</option>
          </select>
          <select className="ql-size" defaultValue="18px">
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="22px">22px</option>
            <option value="24px">24px</option>
            <option value="26px">26px</option>
            <option value="28px">28px</option>
            <option value="30px">30px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
            <option value="60px">60px</option>
          </select>
        </span>
        <span className="ql-formats mt-1">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats mt-1">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-indent" value="-1" />
          <button className="ql-indent" value="+1" />
        </span>
        <span className="ql-formats mt-1">
          <button className="ql-script" value="super" />
          <button className="ql-script" value="sub" />
          <button className="ql-blockquote" />
          <button className="ql-direction" />
        </span>
        <span className="ql-formats mt-1">
          <select className="ql-align" />
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats mt-1">
          <button className="ql-link" />
          <button id="ql-image" className="ql-image"></button>
          <button className="ql-video" />
        </span>
        <span className="ql-formats mt-1">
          <button className="ql-formula" />
          <button className="ql-code-block" />
          <button className="ql-clean" />
        </span>
      </div>
    );
  }

  /* 커스텀 툴바 */

  async function modifyHandler() {
    const formData_save = new FormData();
    let htmlContent_after;
    let tmpcode, tmpcode_after;
  }

  const tmpSaveHandler = (e) => {

  };
  async function saveHandler() {
    //console.log(htmlContent);
    const formData_save = new FormData();
    let htmlContent_after;
    let tmpcode, tmpcode_after;
    //
    let start = htmlContent.indexOf("<pre class=\"ql-syntax\"");
    let end = htmlContent.indexOf(">", start);
    let endend = htmlContent.indexOf("</pre>", end);
    tmpcode = htmlContent.slice(end + 1, endend);
    console.log("저는 코드에용");
    console.log(tmpcode);
    tmpcode_after = tmpcode.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, s => {
      const entityMap = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
      };
      return entityMap[s];
    });
    console.log("저는 후처리 코드에용");
    console.log(tmpcode_after);
    //
    console.log("언어는 " + language);
    imgFileList.map((file) => {
      formData.append('file', file);
    })
    //console.log("폼데이터 : 시발 왜 안떠");
    //console.log(formData.get('file'));
    if (imgFileList.length != 0) {
      await axios
        .post(SERVER_URL + "/til-service/api/v1/boards/image", formData)
        .then((res) => {
          console.log(res);
          res.data.data.map((result) => {
            let tmpUrlList = imgUrlList;
            let tmpNameList = imgNameList;
            let IMG_URL = result.toString().replace("http://localhost:8000", SERVER_URL);
            let imageName = result.toString().replace("http://localhost:8000/til-service/api/v1/images/", "");
            console.log("유알엘 : " + IMG_URL);
            console.log("이름 : " + imageName);
            tmpUrlList.push(IMG_URL);
            tmpNameList.push(imageName);
            setImgUrlList(tmpUrlList);
            setImgNameList(tmpNameList);
          })

          htmlContent_after = htmlContent;
          for (let i = 0; i < imgUrlList.length; i++) {
            htmlContent_after = htmlContent_after.toString().replace(baseUrlList[i], imgUrlList[i]);
          }
          formData_save.append('content', htmlContent_after);
          console.log(htmlContent_after);

          /*
          const IMG_URL = result.data.data; //일케하면되니?
          let NEW_IMG_URL = IMG_URL.toString().replace("http://localhost:8000", SERVER_URL);
          console.log("유알엘 : " + NEW_IMG_URL);
          quillRef.current.getEditor().insertEmbed(range.index, "image", NEW_IMG_URL);
          quillRef.current.getEditor().setSelection(range.index + 1);
          */
        })
        .catch((err) => {
          if (err.response) {
            console.log(err.response.data);
          }
        });
      console.log("이미지 유알엘 리스트 : ");
      console.log(imgUrlList);
    }
    else {
      console.log("이미지 리스트가 없어용~");
      console.log(htmlContent);
      formData_save.append('content', htmlContent);
    }
    formData_save.append('title', title);
    formData_save.append('open', open);
    imgNameList.map((fileName) => {
      formData_save.append('fileName', fileName);
      console.log("fileName = " + fileName);
    })
    //setWritingInfo(formData);
    console.log(formData_save.get('title'));
    console.log(formData_save.get('content'));
    console.log(formData_save.get('open'));
    console.log(formData_save.get('fileName'));
    //console.log("이미지 리스트 : " + imgList);
    await axios
      .post(SERVER_URL + "/til-service/api/v1/boards", formData_save)
      .then((res) => {
        console.log("성공.");
        console.log(res);
      })
      .catch((err) => {
        console.log("실패.");
        if (err.response) {
          console.log(err.response.data);
        }
      });

    //console.log(writingInfo);

  };
  const onTitileInputHandler = (e) => {
    setTitle(e.target.value);
  }
  const onHtmlChangeHandler = (value) => {
    //console.log(htmlContent);
    //console.log(e.target.value);
    setHtmlContent(value);
  };
  return (
    <div class="bg-gradient-to-b from-gray-100 w-full h-screen font-test">
      <EditorToolbar
        imageHandler={imageHandler}
      />
      <div class="w-full h-12"></div>
      <div class="relative bg-white w-[66rem] inset-x-1/2 transform -translate-x-1/2 border-r border-l px-[6rem]">
        <input
          class="focus:outline-0 mt-12 border-b rounded-sm w-full border-slate-300 pt-3 pb-8 px-5 text-3xl font-sbtest"
          defaultValue={prevTitle}
          placeholder="제목"
          onChange={onTitileInputHandler}
        />
        <ReactQuill
          defaultValue={prevContent}
          ref={quillRef}
          onChange={onHtmlChangeHandler}
          modules={modules}
          class="w-[60rem] h-full"
          theme="snow"
        />
      </div>
      <div class="w-full h-16 "></div>
      <div class="fixed w-full h-16 bottom-0 bg-gray-100 border-b border border-gray-300 z-50 flex justify-end items-center gap-5 px-2">

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={() => {
              setOpen(!open);
            }}
          />
          <div>비공개</div>
        </div>
        <button
          class="rounded-[18px] bg-none border border-gray-400 text-gray-600 font-sbtest px-5 py-2 flex items-center gap-2"
          onClick={tmpSaveHandler}
        >
          <div class="text-center">임시저장</div>
          <div class="h-3/5 w-1 border-l border-gray-400"></div>
          <div class="text-center text-gray-600 font-ltest">0</div>
        </button>
        <button
          class="rounded-[18px] bg-gray-700 text-white font-sbtest px-6 py-2 mr-6"
          onClick={() => {
            saveHandler()
            //navigate("/blog/main/1");
          }}
        >
          작성하기
        </button>
      </div>
    </div>
  );
}

export default BlogEditor;
