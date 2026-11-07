# מערכת להזמנת חדרי ישיבות

אפליקציית Web קטנה לצפייה, יצירה וביטול של הזמנות לחדרי ישיבות. המערכת
מורכבת מממשק Angular, שרת ASP.NET Core Web API ומסד נתונים SQL Server LocalDB.

## מבנה הפרויקט

- `api/` — שרת ASP.NET Core Web API והוראות ההרצה שלו.
- `client/` — אפליקציית Angular והוראות ההרצה שלה.
- `db/schema.sql` — יצירת טבלאות מסד הנתונים.
- `db/sample-data.sql` — נתוני דוגמה לחדרים ולהזמנות.

## דרישות מוקדמות

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

## 1. הפעלה

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

## 2. החלטות טכנולוגיות

- **Client:** Angular עם רכיב standalone וטפסים ריאקטיביים, כדי לשמור על מבנה
  פשוט ולבצע ולידציה של טופס ההזמנה.
- **Server:** ASP.NET Core Web API עם Controllers ו־Entity Framework Core,
  המחובר ל־SQL Server LocalDB.
- **מניעת חפיפות:** השרת בודק חפיפות בתוך טרנזקציית `Serializable`. זמני הזמנה
  נחשבים לחופפים אם שעת ההתחלה קודמת לסיום ההזמנה הקיימת ושעת הסיום מאוחרת
  מהתחלתה. לכן הזמנות צמודות מותרות.
- **שגיאות:** ה־API מחזיר קודי HTTP מתאימים וה־Client מציג הודעות שגיאה
  למשתמש.

## 3. מה לא הושלם והמשך עבודה
 קודם כל במערכות מסוג זה הייתי בונה מנגנון למניעת עדכון\הוספת רשומה משני יוזרים בו זמנית. יש שיטות שונות, לדוגמה הייתי משתמש בconcurrency optimistic.
 הייתי מוסיף תיאור חדרים, התאמה למספר אנשים, user authentication, בדיקות אוטומציה.

**בדיקות שבוצעו:** `dotnet build`.

  ## 4. זמני פיתוח
  יצירת בסיס נתונים - 10 דקות,
  יצירה, code review ובדיקה של webapi - 40 דקות,
  יצירה, code review ובדיקה של אפליקציה קליינט - 40 דקות,
  עריכה של קובץ readme - 20

