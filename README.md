# מערכת להזמנת חדרי ישיבות

אפליקציית Web קטנה לצפייה, יצירה וביטול של הזמנות לחדרי ישיבות. המערכת
מורכבת מממשק Angular, שרת ASP.NET Core Web API ומסד נתונים SQL Server LocalDB.

## 1. דרישות מוקדמות

- .NET 10 SDK
- Node.js 24 ומעלה ו־npm
- SQL Server LocalDB עם מופע `(localdb)\MSSQLLocalDB`
- מסד נתונים בשם `iai`

אם מסד הנתונים `iai` עדיין לא קיים, צרו אותו פעם אחת:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -d master -Q "CREATE DATABASE iai"
```

מתוך תיקיית הפרויקט, צרו את הטבלאות והוסיפו נתוני דוגמה:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -d iai -i .\db\schema.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d iai -i .\db\sample-data.sql
```

## 2. הפעלה

פתחו שני חלונות PowerShell מתוך תיקיית הפרויקט.

בחלון הראשון הפעילו את ה־API:

```powershell
dotnet run --project .\api\api.csproj
```

ה־API מאזין ב־`http://localhost:5128`. תיעוד OpenAPI זמין בסביבת פיתוח בכתובת
`http://localhost:5128/openapi/v1.json`.

בחלון השני הפעילו את Angular:

```powershell
cd .\client
npm install
npm start
```

פתחו בדפדפן את `http://localhost:4200`. ה־API צריך להישאר פועל בזמן השימוש
בממשק. לעצירת כל אחד מהשרתים לחצו `Ctrl+C` בחלון המתאים.

## 3. החלטות טכנולוגיות

- **Client:** Angular עם רכיב standalone וטפסים ריאקטיביים, כדי לשמור על מבנה
  פשוט ולבצע ולידציה של טופס ההזמנה.
- **Server:** ASP.NET Core Web API עם Controllers ו־Entity Framework Core,
  המחובר ל־SQL Server LocalDB.
- **מניעת חפיפות:** השרת בודק חפיפות בתוך טרנזקציית `Serializable`. זמני הזמנה
  נחשבים לחופפים אם שעת ההתחלה קודמת לסיום ההזמנה הקיימת ושעת הסיום מאוחרת
  מהתחלתה. לכן הזמנות צמודות מותרות.
- **שגיאות:** ה־API מחזיר קודי HTTP מתאימים וה־Client מציג הודעות שגיאה
  למשתמש.

## 4. בדיקות, מה לא הושלם והמשך עבודה

**בדיקות שבוצעו:** `dotnet build` עבור ה־API,‏ `npm run build` עבור Angular,
ובדיקות ידניות מול LocalDB והממשק: טעינת חדרים והזמנות, יצירת הזמנה, ביטול,
דחיית הזמנה חופפת, אישור הזמנה צמודה, ודחיית טווח תאריכים לא תקין.

**מה לא הושלם:** לא נכתבו בדיקות אוטומטיות.

**בשעתיים נוספות:** הייתי מוסיף בדיקות אינטגרציה ל־API, כולל בדיקה של בקשות
יצירה מקבילות, ובדיקות E2E לזרימות המרכזיות בממשק.

**זמן שהושקע:** כשעתיים, לפי ההערכה.

## מבנה הפרויקט

- `api/` — שרת ASP.NET Core Web API והוראות ההרצה שלו.
- `client/` — אפליקציית Angular והוראות ההרצה שלה.
- `db/schema.sql` — יצירת טבלאות מסד הנתונים.
- `db/sample-data.sql` — נתוני דוגמה לחדרים ולהזמנות.
