  async function sha1(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}


async function isPasswordPwned(password) {
  const fullHash = await sha1(password);
  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();

  const lines = text.split('\n');
  for (const line of lines) {
    const [hashSuffix, count] = line.trim().split(':');
    
    if (hashSuffix === suffix) {
      return parseInt(count);
    }
  }

  return 0; 
}




async function checkPassword() {
  const pwd = document.getElementById("password").value;
  const feedback = document.getElementById("LaptopMessage");

  if (pwd.length < 4) {
    feedback.innerText = "That’s not a password. That’s a sneeze omg no hell naw. make sure its 4 chars or more";
    
    return;
  }


  feedback.innerText = "Checking if your password is out there... 🔍";

  try {
    const count = await isPasswordPwned(pwd);

    if (count > 0) {
      feedback.innerText = `⚠️ Uh oh... this password has been seen ${count.toLocaleString()} times before.`;
    } else {
      feedback.innerText = "✅ This password hasn't been found in known breaches.";
    }

  } catch (err) {
    feedback.innerText = "Error checking password against the dark forces. Try again.";
    console.error(err);
    feedback.innerText = "Guess what the programmer sucks and didnt code this well"
  }
}