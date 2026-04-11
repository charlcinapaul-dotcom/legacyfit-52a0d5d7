import{d as r,s as i}from"./index-BYU6G4gC.js";function n(){return r({queryKey:["active-challenge"],staleTime:3e4,queryFn:async()=>{const{data:{user:a}}=await i.auth.getUser();if(!a)return null;const{data:e,error:t}=await i.from("user_challenges").select(`
          id,
          miles_logged,
          challenge_id,
          is_completed,
          challenge:challenges (
            id,
            title,
            slug,
            total_miles,
            image_url
          )
        `).eq("user_id",a.id).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(t)return console.error("Error fetching active challenge:",t),null;if(!e||!e.challenge)return null;const l=e.challenge;return{id:e.id,challengeId:e.challenge_id,milesLogged:e.miles_logged||0,isCompleted:e.is_completed??!1,slug:l.slug,title:l.title,totalMiles:l.total_miles,imageUrl:l.image_url}}})}export{n as u};
