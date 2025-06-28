---
title: Product Translation using AI
date: '2025-06-22'
author: binarymax
template: article.pug
tags: [i18n,translation]
image: card-image.jpg
imagewidth: 1250
imageheight: 800
description: What if your product or application could be multilingual and support 84 languages in a single sprint? This guide presents a clear and effective way to enable mixed language content and functionality in your application or platform using LLMs.

---

What if your product or application could be multilingual and support 84 languages in a single sprint? This guide presents a clear and effective way to enable mixed language content and functionality in your application or platform using LLMs.

I wrote this guide after implementing internationalization in my [web research platform](https://search.max.io), and then for fun also applied it to this blog! So a nice addition is that you can now read my blog in up to 84 languages without relying on inaccurate browser translations at runtime.


## Background

One overlooked capability of LLMs is multilingual support.  Everyone talks about RAG and Agents and MCP, but it should also be obvious in hindsight that gone are the days of Google translate and specialized internationalization products. You can now deploy incredibly powerful accessibility techniques for non-English speakers, opening your potential reach a much larger and more diverse audience.

Even now, we see over and over apps that are only released in English and are US-centric. This is because the barriers to translation have been significant.  The walls are now much lower as to be insignificant, and there are no more excuses for English-only applications.

Before we get started, the most important thing to state up-front is this: LLMs do a good job of translating, but they’re not perfect and are not a replacement for professional translators.  This is a quantity vs quality tradeoff, and for organizations with the resources to do so should absolutely work with professional linguists.  I’ll show you how to take steps and make sure things are working well, but even afterwards I noticed details that I could not resolve through prompting.

## Process

Here’s what we’re going to do:

 1. Choose a list of languages to support
 2. Setup scaffolding using i18n capabilities
 3. Label your product text
 4. Add context to the text labels
 5. Run the translation
 6. Setup right-to-left specifics
 7. Evaluate
 8. Iterate

## Step 1: The list of languages

I’ve provided a list of 84 languages for you to use, feel free to change as you like to fit your base. Note the specifics of the list:

 - Each language has an identifier, which is normally the two-letter ISO code for the language, but some languages like Chinese and Portuguese have variants represented as 5-letter codes.
 - The `language` property is the English label
 - The `native` property is the the version used by the speakers of that language
 - The `rtl` property is `true` if the language is read right-to-left (like Hebrew and Arabic).

You can default to using every language available in the list (for which I've curated by researching how well models support them).  Doing so can make your app work for *every* language almost instantly. Even for constructed languages like Esperanto or even Klingon.  Commercial LLMs support them all.

You can also selectively choose which languages to support depending on the market you wish to enter.

When translating I used GPT-4o, but you can just as well use Claude or Gemini, and there are likely open weight models that will work too.

```json
{
  "af":   { "language": "Afrikaans",            "native": "Afrikaans",           "rtl": false },
  "sq":   { "language": "Albanian",             "native": "Shqip",               "rtl": false },
  "sm":   { "language": "Amharic",              "native": "አማርኛ",               "rtl": false },
  "ar":   { "language": "Arabic",               "native": "العربية",                "rtl": true  },
  "hy":   { "language": "Armenian",             "native": "Հայերեն",             "rtl": false },
  "az":   { "language": "Azerbaijani",          "native": "Azərbaycan dili",     "rtl": false },
  "eu":   { "language": "Basque",               "native": "Euskara",             "rtl": false },
  "be":   { "language": "Belarusian",           "native": "Беларуская",          "rtl": false },
  "bn":   { "language": "Bengali",              "native": "বাংলা",                "rtl": false },
  "bh":   { "language": "Bihari",               "native": "भोजपुरी",               "rtl": false },
  "bs":   { "language": "Bosnian",              "native": "Bosanski",            "rtl": false },
  "bg":   { "language": "Bulgarian",            "native": "български",           "rtl": false },
  "ca":   { "language": "Catalan",              "native": "Català",              "rtl": false },
  "zh-CN":{ "language": "Chinese (Simplified)", "native": "简体中文",             "rtl": false },
  "zh-TW":{ "language": "Chinese (Traditional)","native": "繁體中文",             "rtl": false },
  "hr":   { "language": "Croatian",             "native": "Hrvatski",            "rtl": false },
  "cs":   { "language": "Czech",                "native": "Čeština",             "rtl": false },
  "da":   { "language": "Danish",               "native": "Dansk",               "rtl": false },
  "nl":   { "language": "Dutch",                "native": "Nederlands",          "rtl": false },
  "en":   { "language": "English",              "native": "English",             "rtl": false },
  "eo":   { "language": "Esperanto",            "native": "Esperanto",           "rtl": false },
  "et":   { "language": "Estonian",             "native": "Eesti",               "rtl": false },
  "fo":   { "language": "Faroese",              "native": "Føroyskt",            "rtl": false },
  "fi":   { "language": "Finnish",              "native": "Suomi",               "rtl": false },
  "fr":   { "language": "French",               "native": "Français",            "rtl": false },
  "fy":   { "language": "Frisian",              "native": "Frysk",               "rtl": false },
  "gl":   { "language": "Galician",             "native": "Galego",              "rtl": false },
  "ka":   { "language": "Georgian",             "native": "ქართული",             "rtl": false },
  "de":   { "language": "German",               "native": "Deutsch",             "rtl": false },
  "el":   { "language": "Greek",                "native": "Ελληνικά",            "rtl": false },
  "gu":   { "language": "Gujarati",             "native": "ગુજરાતી",               "rtl": false },
  "iw":   { "language": "Hebrew",               "native": "עברית",               "rtl": true  },
  "hi":   { "language": "Hindi",                "native": "हिन्दी",                "rtl": false },
  "hu":   { "language": "Hungarian",            "native": "Magyar",              "rtl": false },
  "is":   { "language": "Icelandic",            "native": "Íslenska",            "rtl": false },
  "id":   { "language": "Indonesian",           "native": "Bahasa Indonesia",    "rtl": false },
  "ia":   { "language": "Interlingua",          "native": "Interlingua",         "rtl": false },
  "ga":   { "language": "Irish",                "native": "Gaeilge",             "rtl": false },
  "it":   { "language": "Italian",              "native": "Italiano",            "rtl": false },
  "ja":   { "language": "Japanese",             "native": "日本語",               "rtl": false },
  "jw":   { "language": "Javanese",             "native": "Basa Jawa",           "rtl": false },
  "kn":   { "language": "Kannada",              "native": "ಕನ್ನಡ",               "rtl": false },
  "ko":   { "language": "Korean",               "native": "한국어",                "rtl": false },
  "la":   { "language": "Latin",                "native": "Latina",              "rtl": false },
  "lv":   { "language": "Latvian",              "native": "Latviešu",            "rtl": false },
  "lt":   { "language": "Lithuanian",           "native": "Lietuvių",            "rtl": false },
  "mk":   { "language": "Macedonian",           "native": "Македонски",          "rtl": false },
  "ms":   { "language": "Malay",                "native": "Bahasa Melayu",       "rtl": false },
  "ml":   { "language": "Malayalam",            "native": "മലയാളം",              "rtl": false },
  "mt":   { "language": "Maltese",              "native": "Malti",               "rtl": false },
  "mr":   { "language": "Marathi",              "native": "मराठी",                 "rtl": false },
  "ne":   { "language": "Nepali",               "native": "नेपाली",                "rtl": false },
  "no":   { "language": "Norwegian",            "native": "Norsk",               "rtl": false },
  "nn":   { "language": "Norwegian (Nynorsk)",  "native": "Norsk (Nynorsk)",     "rtl": false },
  "oc":   { "language": "Occitan",              "native": "Occitan",             "rtl": false },
  "fa":   { "language": "Persian",              "native": "فارسی",               "rtl": true  },
  "pl":   { "language": "Polish",               "native": "Polski",              "rtl": false },
  "pt-BR":{ "language": "Portuguese (Brazil)",  "native": "Português (Brasil)",  "rtl": false },
  "pt-PT":{ "language": "Portuguese (Portugal)","native": "Português",           "rtl": false },
  "pa":   { "language": "Punjabi",              "native": "ਪੰਜਾਬੀ",                "rtl": false },
  "ro":   { "language": "Romanian",             "native": "Română",              "rtl": false },
  "ru":   { "language": "Russian",              "native": "Русский",             "rtl": false },
  "gd":   { "language": "Scots Gaelic",         "native": "Gàidhlig",            "rtl": false },
  "sr":   { "language": "Serbian",              "native": "Српски",              "rtl": false },
  "si":   { "language": "Sinhalese",            "native": "සිංහල",                "rtl": false },
  "sk":   { "language": "Slovak",               "native": "Slovenčina",          "rtl": false },
  "sl":   { "language": "Slovenian",            "native": "Slovenščina",         "rtl": false },
  "es":   { "language": "Spanish",              "native": "Español",             "rtl": false },
  "su":   { "language": "Sundanese",            "native": "Basa Sunda",          "rtl": false },
  "sw":   { "language": "Swahili",              "native": "Kiswahili",           "rtl": false },
  "sv":   { "language": "Swedish",              "native": "Svenska",             "rtl": false },
  "tl":   { "language": "Tagalog",              "native": "Tagalog",             "rtl": false },
  "ta":   { "language": "Tamil",                "native": "தமிழ்",                "rtl": false },
  "te":   { "language": "Telugu",               "native": "తెలుగు",               "rtl": false },
  "th":   { "language": "Thai",                 "native": "ไทย",                 "rtl": false },
  "ti":   { "language": "Tigrinya",             "native": "ትግርኛ",               "rtl": false },
  "tr":   { "language": "Turkish",              "native": "Türkçe",              "rtl": false },
  "uk":   { "language": "Ukrainian",            "native": "Українська",          "rtl": false },
  "ur":   { "language": "Urdu",                 "native": "اُردُو",                "rtl": true  },
  "uz":   { "language": "Uzbek",                "native": "Oʻzbek",              "rtl": false },
  "vi":   { "language": "Vietnamese",           "native": "Tiếng Việt",          "rtl": false },
  "cy":   { "language": "Welsh",                "native": "Cymraeg",             "rtl": false },
  "xh":   { "language": "Xhosa",                "native": "isiXhosa",            "rtl": false },
  "zu":   { "language": "Zulu",                 "native": "isiZulu",             "rtl": false }
}
```


## Step 2: i18n

i18n stands for “Internationalization”.  This is the process (and usually the set of application libraries and additions) to make your site or app work for other languages and regions (countries). The second part is important - some languages, like Portuguese, have significant differences between countries and you will need multiple translations. Others, like French, have minor differences between countries and you might not need multiple translations. However, use good judgement for your application and user base!

So to manage these, you need to track two things in your app: the language and country of the user. I use the standard accepted parameters ‘hl’ for “host language” and ‘gl’ for “geographic location”.

On the web, browsers will handily send a header “Accept-Language” which is set to how the user installed their operating system or browser.  In iOS, this is found in NSLocale.  In Android, this is found in the Locale.getDefault class and method.

I’m going to focus on web for this article. And the Accept-Language header usually has everything we need. Language is provided as a 2-letter code and sometimes so is country.  You’ll need fallback defaults (usually en-US) when the header is missing some of the info. I encourage you to read up on the specifics on Mozilla's [Accept-Language header reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language).

When a new request comes in, check and use the following in order: 

1. The hl and gl params in the query string.
2. The hl and gl params in a cookie
3. The Accept-Language header

If you get the querystring values, set the cookie, as this implies the user overrides the Accept-Language header and the application should remember for the user.  If there are neither overrides nor cookies, then infer from the Accept-Language header.  This process is called the ‘negotiation’ of locale selection, and it can be tricky to implement to test thoroughly.  Other options include redirecting to a localization path on the site (such as /es/ for the Spanish version, or /pt-BR/ for Brazilian Portuguese).

No matter what, you need to let the user decide! Always show and provide UI overrides for the language and country - so if you guess wrong you give them a way out.

So with that background knowledge, you’re ready to setup the basics. Install the i18n library and add some negotiation code to detect the hl and gl params, and set them in querystrings and cookies where appropriate. I’ve included an example node/express middleware to help out with this.

## Step 3: Label your product

i18n provides handy methods for providing a label identifier to lookup the appropriate translated text for the set locale of the user.  These methods will work in common template libraries and front end frameworks.

This is the tedious part, but an LLM or an IDE like cursor can help make this easy. In effect you need to take all the text from your product and put it in a JSON file, and replace that text with i18n lookups.

Let’s look at a simple example.  We have a page with a form, and we’ll create labels for the text.  We start by showing the original English-only version, then the in-situ replacements with label ids, and the basis for our translations with the text value “VALUE” and a blank contextual description “CONTEXT”.

##### Example starting form

```html
  <h1>Customer Feedback</h1>
  <p>Please complete the following form to submit feedback about our product.</p>
  <form action="/feedback" method="post">
    <div class="form-group mb-3">
      <label for="email">Email:</label>
      <input type="email" class="form-control" id="email" name="email">
      <p class="fieldnote">(Optional) If you provide your email, we will be in touch if your note requires a reply</p>
    </div>
    <div class="form-group mb-3">
      <label for="feedback">Feedback:</label>
	  <textarea class="form-control" id="feedback" name="feedback" required></textarea>
	  <p class="fieldnote">Please let us know your opinion!</p>
    </div>
    <button type="submit" class="btn btn-purple">Send</button>
  </form>
```

##### Example labelled form

```html
  <h1><%=__('feedbackform.title')%></h1>
  <p><%=__('feedbackform.instructions')%></p>
  <form action="/feedback" method="post">
    <div class="form-group mb-3">
      <label for="email"><%=__('feedbackform.email')%>:</label>
      <input type="email" class="form-control" id="email" name="email">
      <p class="fieldnote"><%=__('feedbackform.email_note')%></p>
    </div>

    <div class="form-group mb-3">
      <label for="feedback"><%=__('feedbackform.feedback')%>:</label>
	  <textarea class="form-control" id="feedback" name="feedback" required></textarea>
	  <p class="fieldnote"><%=__('feedbackform.feedback_note')%></p>
    </div>
    <button type="submit" class="btn btn-purple"><%=__('feedbackform.sendbutton')%></button>
  </form>
```

Then, we create a `__source.json` file, that will contain all our labels matched to the identifiers:

```json
{
  "feedbackform": {
    "title": {
      "VALUE":"Customer Feedback",
      "CONTEXT":""
    },
    "instructions": {
      "VALUE":"Please complete the following form to submit feedback about our product.",
      "CONTEXT":""
    },
    "email": {
      "VALUE":"Email",
      "CONTEXT":""
    },
    "email_note": {
      "VALUE":"(Optional) If you provide your email, we will be in touch if your note requires a reply",
      "CONTEXT":""
    },
    "feedback": {
      "VALUE":"Feedback",
      "CONTEXT":""
    },
    "feedback_note": {
      "VALUE":"Please let us know your opinion!",
      "CONTEXT":""
    },
    "sendbutton": {
      "VALUE":"Send",
      "CONTEXT":""
    }
  }
}
```

You need to do this for every piece of text in your application for which you need a translation. I suggest, however, NOT translating legally important texts like your privacy policy, terms of use, license agreements, etc. It’s best to leave those in English and let lawyers and professional linguists handle those if you need to provide translated legal terms in other markets.

We'll fill out the `CONTEXT` values in the next step.

## Step 4: Add context to your labels

This task is less tedious, but takes more time.  The purpose of this is to provide contextual information to the LLM for every label.  LLMs will do poorly if they lack context. For example, if you have a button whose text is “Cancel”, you need to elaborate for the AI model exactly how it should be translated.  This context is a straightforward description, like “A button that cancels the purchase form submission”.  You can be concise and direct, and adding context is very important especially for short labels.  Doing so will vastly increase the accuracy of the translation.

See the completed example from above, now with added `CONTEXT` values.

```json
{
  "feedbackform": {
    "title": {
      "VALUE":"Customer Feedback",
      "CONTEXT":"The title of a customer feedback form on a webpage"
    },
    "instructions": {
      "VALUE":"Please complete the following form to submit feedback about our product.",
      "CONTEXT":"Instructions for completing a customer feedback form"
    },
    "email": {
      "VALUE":"Email",
      "CONTEXT":"The label for a text field for which a feedback respondant will provide their email"
    },
    "email_note": {
      "VALUE":"(Optional) If you provide your email, we will be in touch if your note requires a reply",
      "CONTEXT":"Instructions for an email text field on a feedback form"
    },
    "feedback": {
      "VALUE":"Feedback",
      "CONTEXT":"The label for a textarea field for which a feedback respondant will provide their opinion"
    },
    "feedback_note": {
      "VALUE":"Please let us know your opinion!",
      "CONTEXT":"Instructions for a feedback textarea field on a feedback form"
    },
    "sendbutton": {
      "VALUE":"Send",
      "CONTEXT":"A button on a webpage that will send a feedback form to the server"
    }
  }
}
```

You may be thinking "*Wow, that is alot of context*" and you are absolutely right. It is important to give as much context as possible because without it, the translation may be incorrect if there is any ambiguity of terms in the label.

## Step 5: Translate!

A short script and a bit of prompting will make quick work of the hard part, translating all the labels for you.  Depending on the number and length of the labels this may take a little while, but you can also parallelize the job to shorten the time linearly.

When translating, you require the following: the source label/context pair, the target language, and a system prompt.

#### System Prompt

This is the system prompt used. The `${target}` must be replaced with the target language value. I found using BOTH the native and English version of the target works best, for example `Espanol (Spanish)`.

The `${context}` is the CONTEXT value you created for the label from step 4.  As the context is provided in the system prompt, the `user` prompt will contain the label from step 3 only.

This technique helps focus the LLM to only attempt translation of the user prompt label guided by the instructions in the system prompt.

<div class="markdown-prompt">

You are a helpful translator that takes an English website i18n entry and translates to the following language as faithfully and accurately as possible: <code>${target}</code>

Rely on the following context for the translation: <code>${context}</code>

When generating output:
- Use vocabulary, grammar, and spelling consistent with the specified language.
- Prioritize accuracy and be certain to match the purpose of the original.
- Always maintain the same level of formality and professionalism.

Do not explain your decisions.
</div>


Here is the script. Note that it uses my library “llm-primitives” because it works perfectly for this use case.  It translates a label in one line and automatically caches responses for when we need to add labels later and retranslate.

```javascript

//Translates a single label given the language, value, and context
async function translateEntry(lang,value,context) {
	const llm = new LLM({
		apiKey:process.env.OPENAI_API_KEY,
		model:"gpt-4o",
		system:getsystemlocale(lang,context)
	});
	const entry = await llm.string(value);
	return entry;
}

//Walks a __source.json tree of labels and translates each entry
//The result is an i18n compatible json file
async function translateTree(input, lang) {
    async function recurse(node) {
        if (typeof node !== 'object' || node === null) {
            return node;
        }

        if (node.VALUE && node.CONTEXT) {
        	if(lang.language.toLowerCase()=='english') {
        		//Don't translate the source English!
        		return node.VALUE;
        	} else {
        		//Another language --> Tranlate the label with the context!
            	return await translateEntry(lang, node.VALUE, node.CONTEXT);
            }
        }

        const result = Array.isArray(node) ? [] : {};

        for (const key of Object.keys(node)) {
            result[key] = await recurse(node[key]);
        }

        return result;
    }

    return await recurse(input);
}


//Translates __source.json labels into a target language (i.e. 'es')
async function translateUI(key) {
	const lang = langs[key];
	const file = path.join(localedir,key+'.json');
	const i18n = await translateTree(sourcelocale, lang);
	fs.writeFileSync(file,JSON.stringify(i18n, null, 2),'utf-8');
}
```

Calling `await translateUI('es')` will translate all the labels in the `__source.json` file into Spanish, and to translate all languages, you can just iterate over them:

```javascript
//Main translation loop for all the language keys in `lk`
async function main() {
	const startall = (new Date())-0;
	for (const key of lk) {
		const lang = langs[key];
		const start = (new Date())-0;
		await translateUI(key)
		const end = (new Date())-0;
		const took = (end-start)/1000;
		console.log(`Finished ${lang.language} (${lang.native}) in ${took}s`);
	}
	const endall = (new Date())-0;
	const tookall = (endall-startall)/1000;
	console.log(`Translated ${lk.length} languages in ${tookall}s`);
	fs.writeFileSync('langs.json',JSON.stringify(langs,null,2),'utf-8');
}

main()
```

## Step 6: Right-to-left (RTL)

Some languages such as Hebrew and Arabic read right-to-left. You can make things work properly for those users by showing the text correctly and aligning right.  Here are some css classes to help out.  Note the language list above from step 1 has the “rtl” property for each language, set to true for RTL languages.  Use that property to set the style for the page appropriately.

This is an easy addition to your stylesheet that enables this feature. Put it at the top level (your body tag for example) for any text you want to read right-to-left.  If your page has mixed content, then you can apply this to specific elements appropriately.

```css
.rtl {
  direction: rtl;
  unicode-bidi: bidi-override;
  text-align:right;
}

.rtl * {
  direction: rtl!important;
  unicode-bidi: bidi-override!important;
  text-align:right!important;
}
```

## Step 7: Evaluate

Once the translation is complete, you can test your outcomes, and admire in wonder as everything just works. However, unless someone actually looks at it, you cannot be certain.  And this is where the gap lies of quantity vs quality.  If you are translating to Swahili, do you know someone who can read through it and give you feedback?  If not, then you should either keep it labeled with beta in your product, or remove it completely.

## Step 8: Iterate

As your product evolves, and you add more features and text, you now have the structure in place to translate as a step of deployment.  The llm-primitives library caches all responses in a SQLite database, so if you have already translated a thousand labels into 84 languages, and add or change a label, you won't need to infer the translation from scratch and only the changes will be sent to the LLM API.

## Conclusion

See you next time.