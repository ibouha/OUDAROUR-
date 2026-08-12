import { config } from "dotenv";
config({ path: ".env.local" }); config();
import { hash } from "bcryptjs";
import { getDb } from "../lib/db/index";
import { companySettings, products, users } from "../lib/db/schema";

async function seed(){
  const email=(process.env.SEED_ADMIN_EMAIL||"admin@oudarour.local").toLowerCase();
  const password=process.env.SEED_ADMIN_PASSWORD||"ChangezMoi123!";
  const passwordHash=await hash(password,12);
  const db=getDb();
  await db.insert(users).values({name:"Administrateur",email,passwordHash,isActive:true}).onConflictDoUpdate({target:users.email,set:{name:"Administrateur",passwordHash,isActive:true,updatedAt:new Date()}});
  const [settings]=await db.select({id:companySettings.id}).from(companySettings).limit(1);
  if(!settings)await db.insert(companySettings).values({companyName:"SOCIETE OUDAROUR FOOD SARL",tradeName:"OUDAROUR FOOD",country:"Maroc",currency:"MAD",invoicePrefix:"FAC",defaultVat:"20.00",paymentTerms:"Paiement à 30 jours.",invoiceFooter:"Merci pour votre confiance."});
  const catalog=[
    {reference:"MIEL-001",name:"Miel de fleurs 500g",category:"HONEY",unit:"JAR",priceHt:"65.00",vatRate:"20.00"},
    {reference:"MIEL-002",name:"Miel d'eucalyptus 500g",category:"HONEY",unit:"JAR",priceHt:"75.00",vatRate:"20.00"},
    {reference:"CONF-001",name:"Confiture de fraise 370g",category:"JAM",unit:"JAR",priceHt:"25.00",vatRate:"20.00"},
    {reference:"CONF-002",name:"Confiture d'abricot 370g",category:"JAM",unit:"JAR",priceHt:"27.00",vatRate:"20.00"},
    {reference:"SIROP-001",name:"Sirop de grenadine 1L",category:"SYRUP",unit:"BOTTLE",priceHt:"30.00",vatRate:"20.00"},
    {reference:"SIROP-002",name:"Sirop de menthe 1L",category:"SYRUP",unit:"BOTTLE",priceHt:"30.00",vatRate:"20.00"},
  ];
  for(const product of catalog)await db.insert(products).values(product).onConflictDoNothing({target:products.reference});
  console.log(`Données initiales créées. Compte : ${email}`);
}
seed().then(()=>process.exit(0)).catch(error=>{console.error("Échec du seed :",error);process.exit(1)});
