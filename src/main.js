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
    if (hashSuffix === suffix) return parseInt(count);
  }

  return 0;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const shortResponses = [
  "Is that a password or did your cat step on the keyboard?",
  "Try again. Maybe this time with a password and not a sneeze.",
  "You just typed 'uh'. That’s not even a full thought.",
  "A toddler could brute-force that while eating glue.",
  "Your microwave password has stronger defense.",
  "This password is sponsored by 'Please Rob Me Inc.'",
  "It’s not a password, it’s a war crime in ASCII form."
];

const loadingResponses = [
  "Grabbing your data and sending it to North Korea... (jk unless?)",
  "Rummaging through 10 billion password corpses...",
  "Summoning a demon to shame your security habits...",
  "Hitting the API like it owes me money...",
  "Injecting caffeine into the servers for speed...",
  "Sacrificing a CAPTCHA to summon results...",
  "Decrypting ancient runes... no wait, it's just your awful password.",
];

const pwnedResponses = (count) => [
  `Ah yes. This password's been saw ${count.toLocaleString()} times. Bold move.`,
  `You and ${count.toLocaleString()} other clowns thought this was original.`,
  `Welcome to the Hall of Fame of terrible passwords. ${count.toLocaleString()} entries.`,
  `Bro. ${count.toLocaleString()} hits. Even your toaster knows this one.`,
  `Yup, that’s a certified dumpster fire. Seen ${count.toLocaleString()} times.`,
  `Used ${count.toLocaleString()} times. Iconic. Tragically iconic.`,
  `That's not a password, it's public domain at this point.`,
  `Even your grandma's flip phone has this password saved. (${count.toLocaleString()} breaches)`
];

const safeResponses = [
  "Congrats! You made a password no one else wanted. Impressive.",
  "It's not in the breach list, but it still sucks emotionally.",
  "Sure, it’s safe. Emotionally? Not so much.",
  "Okay, it’s unique. Like a gas station hot dog at 2am.",
  "No one's used this before... possibly for a reason.",
  "Safe. But like, Nickelback safe. Technically fine. Still questionable.",
  "This one hasn’t been breached—yet. Don’t get cocky.",
  "You're good... this time. But I'm watching you."
];

const errorResponses = [
  "Oops! The server tripped and fell. Very professional.",
  "404: Password roast not found. Try again, genius.",
  "I broke it. It's broken. You're broken. Everything’s broken.",
  "Great. The code crashed. Just like my hopes and dreams.",
  "Well, that didn’t work. But hey, at least your password still sucks.",
  "Even the API didn’t wanna deal with your input.",
  "Too much stupidity detected. System overloaded.",
  "Hackerman.exe stopped responding. Classic."
];

async function checkPassword() {
  const pwd = document.getElementById("password").value;
  const feedback = document.getElementById("LaptopMessage");

  if (pwd.length < 4) {
    feedback.innerText = pickRandom(shortResponses);
    return;
  }

  feedback.innerText = pickRandom(loadingResponses);

  try {
    const count = await isPasswordPwned(pwd);
    feedback.innerText = count > 0
      ? pickRandom(pwnedResponses(count))
      : pickRandom(safeResponses);
  } catch (err) {
    console.error(err);
    feedback.innerText = pickRandom(errorResponses);
  }
}
