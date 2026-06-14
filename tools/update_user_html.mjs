import fs from "fs";

const filePath = "user.html";
let content = fs.readFileSync(filePath, "utf8");

const startTag = '<div class="user-profile">';
const endTag = '<h3 id="profileName">Khach</h3>';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag) + endTag.length;

if (startIndex !== -1 && endIndex > startIndex) {
  const newBlock = `      <div class="user-profile">
        <div class="avatar-container" style="position: relative; display: inline-block;">
          <img
            id="profileAvatar"
            src="images/categories/mg.jpg"
            class="avatar"
            style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 2px solid var(--primary);"
          />
          <button 
            id="uploadAvatarBtn"
            style="position: absolute; bottom: 5px; right: 5px; background: var(--primary); border: none; border-radius: 50%; width: 32px; height: 32px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;"
            title="Đổi ảnh đại diện"
          >
            <i class="fas fa-camera"></i>
          </button>
          <input type="file" id="avatarInput" accept="image/*" style="display: none;" />
        </div>

        <h3 id="profileName">Khach</h3>`;

  content =
    content.substring(0, startIndex) + newBlock + content.substring(endIndex);
  fs.writeFileSync(filePath, content);
  console.log("Successfully updated user.html");
} else {
  console.error("Could not find tags in user.html");
  process.exit(1);
}
