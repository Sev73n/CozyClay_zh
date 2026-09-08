import { useEffect, useState } from "react";
import { ko } from "./locale.js";
import {
	hasDirectoryPicker,
	hasFileSystemAccess,
	listProjectsInDirectory,
	loadProjectsDirectory,
	loadRecentProjects,
	pickProjectsDirectory,
	queryHandlePermission,
	removeRecentProject,
	requestHandlePermission,
	storeProjectsDirectory,
} from "./project.js";

export function ProjectNameDialog({ open, initialName = "My Project", onCancel, onSubmit }) {
	const [value, setValue] = useState(initialName);
	useEffect(() => {
		if (open) setValue(initialName);
	}, [open, initialName]);
	if (!open) return null;
	const submit = (event) => {
		event.preventDefault();
		const name = value.trim() || "My Project";
		onSubmit(name);
	};
	return (
		<div className="project-name-dialog-backdrop" role="presentation">
			<form className="project-name-dialog" role="dialog" aria-modal="true" aria-labelledby="project-name-dialog-title" onSubmit={submit}>
				<strong id="project-name-dialog-title">{ko("Project name", "프로젝트 이름", "项目名称")}</strong>
				<label>
					<span>{ko("Name", "이름", "名称")}</span>
					<input autoFocus value={value} onChange={(event) => setValue(event.target.value)} aria-label={ko("Project name", "프로젝트 이름", "项目名称")} />
				</label>
				<div className="project-name-dialog-actions">
					<button type="button" className="btn ghost" onClick={onCancel}>{ko("Cancel", "취소", "取消")}</button>
					<button type="submit" className="btn primary">{ko("Create", "생성", "创建")}</button>
				</div>
			</form>
		</div>
	);
}

/**
 * Game-engine style project picker. Two sources of truth:
 *  - Recents: everything the operator opened or saved before (always works).
 *  - A projects folder: when granted, the folder is enumerated so files the
 *    operator never opened in THIS browser show up too.
 * Fallback for browsers without the File System Access API: recents plus a
 * plain "open file" button (the folder section is hidden).
 */
export default function ProjectBrowser({ currentName, onOpen, onOpenFile, onNew, onClose, startup = false }) {
	const [recents, setRecents] = useState([]);
	const [folder, setFolder] = useState(null);
	const [folderProjects, setFolderProjects] = useState([]);
	const [folderDenied, setFolderDenied] = useState(false);
	// A stored folder handle Chromium demoted to "prompt": one click on the
	// re-allow button re-grants it without re-picking the folder (#51).
	const [lostFolder, setLostFolder] = useState(null);

	useEffect(() => {
		loadRecentProjects().then(setRecents);
		loadProjectsDirectory().then(async (handle) => {
			if (!handle) return;
			const permission = await queryHandlePermission(handle);
			if (permission !== "granted") {
				setFolderDenied(true);
				if (permission === "prompt") setLostFolder(handle);
				return;
			}
			setFolder(handle);
			setFolderProjects(await listProjectsInDirectory(handle));
		});
	}, []);

	const reauthorizeFolder = async () => {
		if (!lostFolder) return;
		if ((await requestHandlePermission(lostFolder)) !== "granted") return;
		const handle = lostFolder;
		setLostFolder(null);
		setFolderDenied(false);
		setFolder(handle);
		setFolderProjects(await listProjectsInDirectory(handle));
	};

	const chooseFolder = async () => {
		try {
			const handle = await pickProjectsDirectory();
			await storeProjectsDirectory(handle);
			setFolder(handle);
			setFolderDenied(false);
			setLostFolder(null);
			setFolderProjects(await listProjectsInDirectory(handle));
		} catch (err) {
			if (err?.name !== "AbortError") setFolderDenied(true);
		}
	};

	const refreshFolder = async () => {
		if (folder) setFolderProjects(await listProjectsInDirectory(folder));
	};

	return (
		<div className={`project-browser-backdrop${startup ? " startup" : ""}`} onPointerDown={(e) => { if (!startup && e.target === e.currentTarget) onClose(); }}>
			<div className={`project-browser${startup ? " startup" : ""}`} role="dialog" aria-label={ko("Choose project", "프로젝트 선택", "选择项目")}>
				<div className="project-browser-head">
					<strong>{startup ? ko("Create your first shot", "첫 샷 만들기", "创建第一条镜头") : ko("Projects", "프로젝트", "项目")}</strong>
					{!startup && <button type="button" className="x" onClick={onClose} aria-label={ko("Close", "닫기", "关闭")}>✕</button>}
				</div>
				{startup && <p className="project-browser-intro">{ko(
					"Start with a named project, then place a character and frame the shot. Your work is saved in that project.",
					"프로젝트 이름을 정하고 인물을 배치한 다음 샷 구도를 잡아 보세요. 작업 내용은 이 프로젝트에 저장됩니다.",
					"先给项目起个名字，摆好人物，再定镜头构图。内容会保存在这个项目里。",
				)}</p>}
				{startup && (
					<section className="beginner-start" aria-label={ko("First shot steps", "첫 샷 단계", "第一条镜头步骤")}>
						<div className="beginner-start-actions">
							<button type="button" className="btn primary beginner-create" onClick={onNew}>
								{ko("Create a project", "프로젝트 만들기", "创建项目")}
							</button>
							<button type="button" className="btn ghost beginner-open" onClick={onOpenFile}>
								{ko("Open a project", "프로젝트 열기", "打开项目")}
							</button>
						</div>
						<div className="beginner-step-grid">
							<div className="beginner-step"><b>1</b><strong>{ko("Place", "배치", "摆放")}</strong><span>{ko("Choose a character and move it on the stage.", "인물을 고르고 무대에서 움직여요.", "选一个人物，在舞台上移动。")}</span></div>
							<div className="beginner-step"><b>2</b><strong>{ko("Frame", "구도", "帧")}</strong><span>{ko("Set the camera view for your shot.", "샷의 카메라 구도를 정해요.", "定好这条镜头的相机构图。")}</span></div>
							<div className="beginner-step"><b>3</b><strong>{ko("Play", "재생", "播放")}</strong><span>{ko("Press play to see the scene come alive.", "재생을 눌러 장면을 확인해요.", "按播放，看场景动起来。")}</span></div>
						</div>
					</section>
				)}

				<section>
					<div className="project-browser-section-head">
						<span>{ko("Recent projects", "최근 프로젝트", "最近项目")}</span>
					</div>
					{recents.length === 0 ? (
						<p className="project-browser-empty">{ko("No projects yet — save one and it shows up here.", "아직 프로젝트가 없어요. 저장하면 여기에 나타납니다.", "还没有项目 — 保存一个就会出现在这里。")}</p>
					) : (
						<ul className="project-browser-list">
							{recents.map((entry) => (
								<li key={entry.name} className={entry.name === currentName ? "active" : ""}>
									<button type="button" onClick={() => onOpen(entry)}>
										<strong>{entry.name}</strong>
										<span>{new Date(entry.openedAt).toLocaleString()}</span>
									</button>
									<button
										type="button"
										className="del"
										title={ko("Remove from list", "목록에서 제거", "从列表移除")}
										onClick={async () => {
											await removeRecentProject(entry.name);
											setRecents(await loadRecentProjects());
										}}
									>
										✕
									</button>
								</li>
							))}
						</ul>
					)}
				</section>

				{hasFileSystemAccess() && hasDirectoryPicker() && (
					<section>
						<div className="project-browser-section-head">
							<span>{ko("Projects folder", "프로젝트 폴더", "项目文件夹")}</span>
							<div className="row-actions">
								{folder && <button type="button" onClick={refreshFolder}>{ko("Refresh", "새로고침", "刷新")}</button>}
								<button type="button" onClick={chooseFolder}>
									{folder ? ko("Change folder…", "폴더 변경…", "更换文件夹…") : ko("Choose folder…", "폴더 지정…", "指定文件夹…")}
								</button>
							</div>
						</div>
						{folderDenied && (
							<p className="project-browser-empty">
								{lostFolder
									? ko("Folder access needs to be re-allowed.", "폴더 접근을 다시 허용해야 해요.", "需要重新允许文件夹访问。")
									: ko("Folder access is not granted — choose it again.", "폴더 접근 권한이 없어요. 다시 지정해 주세요.", "没有文件夹权限 — 请再选一次。")}
								{lostFolder && (
									<button type="button" onClick={reauthorizeFolder}>{ko("Re-allow", "다시 허용", "重新允许")}</button>
								)}
							</p>
						)}
						{folder && folderProjects.length === 0 && !folderDenied && (
							<p className="project-browser-empty">{ko("No .cclayproject files in this folder.", "이 폴더에 .cclayproject 파일이 없어요.", "这个文件夹里没有 .cclayproject 文件。")}</p>
						)}
						{folderProjects.length > 0 && (
							<ul className="project-browser-list">
								{folderProjects.map((entry) => (
									<li key={entry.name} className={entry.name === currentName ? "active" : ""}>
										<button type="button" onClick={() => onOpen(entry)}>
											<strong>{entry.name}</strong>
											<span>{new Date(entry.lastModified).toLocaleString()}</span>
										</button>
									</li>
								))}
							</ul>
						)}
					</section>
				)}

				<div className="project-browser-foot">
					<button type="button" className="btn ghost" onClick={onOpenFile}>{ko("Open file…", "파일로 열기…", "打开文件…")}</button>
					<button type="button" className="btn primary" onClick={onNew}>{ko("New Project", "새 프로젝트", "新建项目")}</button>
				</div>
			</div>
		</div>
	);
}
