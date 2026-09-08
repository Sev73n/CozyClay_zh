import { ko } from "./locale.js";

export default function ResultModal({ result, copied, recordedVideoName, onClose, onCopy, onDownload }) {
	const isVideo = result.mode === "video";
	const modelLabel = result.modelLabel ?? (isVideo ? ko("your AI video tool", "AI 영상 도구", "你的 AI 视频工具") : ko("your selected image model", "선택한 이미지 모델", "你选的图像模型"));
	const hasFrame = Boolean(result.frame);

	let nextStep;
	if (isVideo && result.frameB) {
		nextStep = (
			<p>
				{ko(`Paste the prompt into ${modelLabel}, set `, `${modelLabel}에 프롬프트를 붙여 넣고 `, `把提示词粘贴到 ${modelLabel}，将 `)}
				<code>blocking-frame-A-start.png</code>
				{ko(" as the start frame, and ", "를 시작 프레임으로, ", " 作为起始帧，并把 ")}
				<code>blocking-frame-B-end.png</code>
				{ko(" as the end frame.", "를 끝 프레임으로 설정하세요.", " 作为结束帧。")}
			</p>
		);
	} else if (isVideo && hasFrame) {
		nextStep = (
			<p>
				{ko(`Paste the prompt into ${modelLabel} and attach `, `${modelLabel}에 프롬프트를 붙여 넣고 `, `把提示词粘贴到 ${modelLabel}，并附上 `)}
				<code>blocking-frame.png</code>
				{ko(" as the reference frame.", "를 참고 프레임으로 첨부하세요.", " 作为参考帧。")}
			</p>
		);
	} else if (hasFrame) {
		nextStep = (
			<p>
				{ko(`Paste the prompt into ${modelLabel} and attach `, `${modelLabel}에 프롬프트를 붙여 넣고 `, `把提示词粘贴到 ${modelLabel}，并附上 `)}
				<code>blocking-frame.png</code>
				{ko(" as the reference image.", "를 참고 이미지로 첨부하세요.", " 作为参考图。")}
			</p>
		);
	} else {
		nextStep = <p>{ko(`Paste the copied prompt into ${modelLabel} to create the scene.`, `복사한 프롬프트를 ${modelLabel}에 붙여 넣어 장면을 만드세요.`, `把复制的提示词粘贴到 ${modelLabel} 来创建场景。`)}</p>;
	}

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title" onClick={(event) => event.stopPropagation()}>
				<div className="modal-head">
					<h3 id="result-title">{ko("Your shot is ready", "장면이 준비됐어요", "场景准备好了")}</h3>
					<button type="button" className="x" onClick={onClose} aria-label={ko("Close the result", "결과 닫기", "关闭结果")}>
						✕
					</button>
				</div>
				{result.frameB ? (
					<div className="move-frames">
						<figure>
							<img className="preview" src={result.frame} alt={ko("Camera move start frame", "카메라 움직임 시작 프레임", "相机运动起始帧")} />
							<figcaption>A · {ko("Start", "시작", "开始")}</figcaption>
						</figure>
						<figure>
							<img className="preview" src={result.frameB} alt={ko("Camera move end frame", "카메라 움직임 끝 프레임", "相机运动结束帧")} />
							<figcaption>B · {ko("End", "끝", "结束")}</figcaption>
						</figure>
					</div>
				) : (
					result.frame && <img className="preview" src={result.frame} alt={ko("Finished scene frame", "완성된 장면 프레임", "完成的场景帧")} />
				)}
				{result.move && (
					<div className="move-slate result-move-slate">
						<span>{result.move.displaySlate ?? result.move.slate} · {ko(`${result.move.spanS}s`, `${result.move.spanS}초`, `${result.move.spanS}秒`)}</span>
						<small>{ko("Camera move made from timeline keyframes", "타임라인 키프레임으로 만든 카메라 움직임", "由时间轴关键帧生成的相机运动")}</small>
					</div>
				)}
				<label className="modal-label">{ko("Prompt", "프롬프트", "提示词")} {copied && <em>· {ko("copied", "복사됨", "已复制")}</em>}</label>
				<div className="promptbox">{result.prompt}</div>
				<div className="modal-actions">
					<button type="button" className="btn" onClick={onCopy}>
						{copied ? ko("Copied ✓", "복사됨 ✓", "已复制 ✓") : ko("Copy prompt", "프롬프트 복사", "复制提示词")}
					</button>
					{result.frame && (
						<button type="button" className="btn" onClick={onDownload}>
							{result.frameB ? ko("Download start and end frames", "시작·끝 프레임 다운로드", "下载起止帧") : ko("Download frame", "프레임 다운로드", "下载帧")}
						</button>
					)}
				</div>

				<section className="result-next" aria-labelledby="result-next-title">
					<span className="result-next-kicker">{ko(`Next · ${modelLabel}`, `다음 · ${modelLabel}`, `下一步 · ${modelLabel}`)}</span>
					<h4 id="result-next-title">{ko("Handing off to your AI", "AI에 넣는 순서", "交给你的 AI")}</h4>
					<div className="result-next-intro">{nextStep}</div>
					<ol className="result-handoff-steps">
						<li>
							<strong>{ko("Copy the prompt", "프롬프트 복사", "复制提示词")}</strong>
							<span>{copied ? ko("Copied. Paste it into your AI service's prompt box.", "복사됐어요. AI 서비스의 입력창에 붙여 넣으세요.", "复制好了。粘到你 AI 的输入框就行。") : ko("Press “Copy prompt” above, then paste it into your AI service.", "위의 ‘프롬프트 복사’를 누른 뒤 AI 서비스 입력창에 붙여 넣으세요.", "先点上面的“复制提示词”，再粘到你的 AI。")}</span>
						</li>
						<li>
							<strong>{ko("Download the frame", "프레임 다운로드", "下载帧")}</strong>
							<span>{result.frameB ? ko("Press “Download start and end frames” to save both PNGs.", "‘시작·끝 프레임 다운로드’를 눌러 두 PNG를 저장하세요.", "点“下载起止帧”来保存两张 PNG。") : hasFrame ? ko("Press “Download frame” to save the PNG.", "‘프레임 다운로드’를 눌러 PNG를 저장하세요.", "点“下载帧”来保存 PNG。") : ko("This result has no frame to download.", "이 결과에는 내려받을 프레임이 없어요.", "这个结果没有可下载的帧。")}</span>
						</li>
						<li>
							<strong>{ko("Attach the image to your AI", "AI에 이미지 첨부", "把图片附加到你的 AI")}</strong>
							<span>{result.frameB ? ko("Use your AI service's image attach button to upload the start and end frames together.", "AI 서비스의 이미지 첨부 버튼에서 시작 프레임과 끝 프레임을 함께 올리세요.", "用你 AI 的图片附件按钮，把起始帧和结束帧一起上传。") : ko("Use your AI service's image attach button to upload blocking-frame.png.", "AI 서비스의 이미지 첨부 버튼에서 blocking-frame.png를 올리세요.", "用你 AI 的图片附件按钮上传 blocking-frame.png。")}</span>
						</li>
					</ol>
					<p className="result-handoff-note">
						{ko("The prompt describes the scene's content and mood; the frame shows the camera framing. Use both to reproduce this scene as closely as possible.", "프롬프트는 장면의 내용과 분위기를 설명하고, 프레임은 카메라 구도를 보여줘요. 둘을 함께 넣어야 이 장면을 가장 가깝게 재현할 수 있어요.", "提示词说明场景内容和气氛；帧展示相机构图。两者一起用，才能尽量复现这个场景。")}
					</p>
					{recordedVideoName && (
						<p className="result-reference-video">
							<strong>{ko("Optional · Reference video", "선택 사항 · 참고 영상", "可选 · 参考视频")}</strong>
							{ko("A video recorded with the recording feature: ", "녹화 기능으로 만든 ", "用录制功能拍的视频：")}<code>{recordedVideoName}</code>{ko(" file. Use it separately from the reference frame in the prompt above.", " 파일이에요. 위의 프롬프트 참고 프레임과는 별도로 활용하세요.", " 文件。请和上方提示词里的参考帧分开用。")}
						</p>
					)}
				</section>
			</div>
		</div>
	);
}
