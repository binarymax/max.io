---
title: Calendar Year Converter
date: '2016-02-17'
author: binarymax
template: article.jade
tags: [time,tool]
---

This tool converts a calendar year between Gregorian Common Era (CE) คริสต์ศักราช (ค.ศ.), Jula Sakarat (JS) จุลศักราช (จ.ศ.), Buddhist Era (BE) พุทธศักราช (พ.ศ.), and Ratanakosin Sakarat (RS) รัตนโกสินทร์ศก (ร.ศ.)

---

<section>
    <p>
        <input type="number" pattern="\d*" id="CE" class="calendaryear" /> <label>Common Era (CE) <span class="thai">คริสต์ศักราช (ค.ศ.)</span></label>
    </p>
    
    <p>
        <input type="number" pattern="\d*" id="BE" class="calendaryear" /> <label>Buddhist Era (BE) <span class="thai">พุทธศักราช (พ.ศ.)</span></label>
    </p>
    
    <p>
        <input type="number" pattern="\d*" id="JS" class="calendaryear" /> <label>Jula Sakarat (JS) <span class="thai">จุลศักราช (จ.ศ.)</span></label>
    </p>
    
    <p>
        <input type="number" pattern="\d*" id="RS" class="calendaryear" /> <label>Ratanakosin Sakarat (RS) <span class="thai">รัตนโกสินทร์ศก (ร.ศ.)</span></label>
    </p>
</section>

---

This is for my brother Anthony who, though having mastered Thai as a second language and can read <strike>Aramaic and</strike>* Sanskrit, is still mystified by Excel formulae and Javascript.  Presumably since they are not yet dead languages.

<script type="text/javascript" src="/javascripts/jquery-1.12.0.min.js"></script>
<script type="text/javascript" src="/javascripts/calendaryear.js"></script>

*UPDATE: Anthony cannot read Aramaic