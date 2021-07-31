const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const kagApi = require('@kagchi/kag-api')
const fetch = require('node-fetch')
const tulis = require('./lib/rugaApi')
const tiktod = require('tiktok-scraper')
const ffmpeg = require('fluent-ffmpeg')
const { removeBackgroundFromImageFile } = require('remove.bg')
const imgbb = require('imgbb-uploader')
const lolis = require('lolis.life')
const loli = new lolis()
const welkom = JSON.parse(fs.readFileSync('./src/welkom.json'))
const nsfw = JSON.parse(fs.readFileSync('./src/nsfw.json'))
const samih = JSON.parse(fs.readFileSync('./src/simi.json'))
prefix = '!'
blocked = []

const time = moment().tz('Asia/Jakarta').format("HH:mm:ss")
const arrayBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const bulan = arrayBulan[moment().format('MM') - 1]
const config = {
    tanggal: `TANGGAL: ${moment().format('DD')} ${bulan} ${moment().format('YYYY')}`,
    waktu: time
}

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`
}

async function starts() {
	const client = new WAConnection()
	client.logger.level = 'warn'
	console.log(banner.string)
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
	})
	client.on('credentials-updated', () => {
		fs.writeFileSync('./BarBar.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
		info('2', 'Login Info Updated')
	})
	fs.existsSync('./BarBar.json') && client.loadAuthInfo('./BarBar.json')
	client.on('connecting', () => {
		start('2', 'Connecting...')
	})
	client.on('open', () => {
		success('2', 'Connected')
	})
	await client.connect({timeoutMs: 30*1000})

	client.on('group-participants-update', async (anu) => {
		if (!welkom.includes(anu.jid)) return
		try {
			const mdata = await client.groupMetadata(anu.jid)
			console.log(anu)
			if (anu.action == 'add') {
				num = anu.participants[0]
				try {
					ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Halo @${num.split('@')[0]}\nSelamat datang di group *${mdata.subject}*`
				let buff = await getBuffer(ppimg)
				client.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			} else if (anu.action == 'remove') {
				num = anu.participants[0]
				try {
					ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Sayonara @${num.split('@')[0]}👋`
				let buff = await getBuffer(ppimg)
				client.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
	client.on('CB:Blocklist', json => {
		if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})

	client.on('message-new', async (mek) => {
		try {
			if (!mek.message) return
			if (mek.key && mek.key.remoteJid == 'status@broadcast') return
			if (mek.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const type = Object.keys(mek.message)[0]
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
			body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
			budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
			const isCmd = body.startsWith(prefix)

			mess = {
				wait: '⌛ Sedang di Prosess ⌛',
				success: '✔️ Berhasil ✔️',
				error: {
					stick: '❌ Gagal, terjadi kesalahan saat mengkonversi gambar ke sticker ❌',
					Iv: '❌ Link tidak valid ❌'
				},
				only: {
					group: '❌ Perintah ini hanya bisa di gunakan dalam group! ❌',
					ownerG: '❌ Perintah ini hanya bisa di gunakan oleh owner group! ❌',
					ownerB: '❌ Perintah ini hanya bisa di gunakan oleh owner bot! ❌',
					admin: '❌ Perintah ini hanya bisa di gunakan oleh admin group! ❌',
					Badmin: '❌ Perintah ini hanya bisa di gunakan ketika bot menjadi admin! ❌'
				}
			}

			const botNumber = client.user.jid
			const ownerNumber = ["6281215389681@s.whatsapp.net"] // replace this with your number
			const isGroup = from.endsWith('@g.us')
			const sender = isGroup ? mek.participant : mek.key.remoteJid
			const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isWelkom = isGroup ? welkom.includes(from) : false
			const isNsfw = isGroup ? nsfw.includes(from) : false
			const isSimi = isGroup ? samih.includes(from) : false
			const isOwner = ownerNumber.includes(sender)
			const apiKey = 'YiKNUe-ElDPJV-kSbtMj-cGwqPF-DBoL5w'
			const isUrl = (url) => {
			    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
			}
			const reply = (teks) => {
				client.sendMessage(from, teks, text, {quoted:mek})
			}
			const sendMess = (hehe, teks) => {
				client.sendMessage(hehe, teks, text)
			}
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
			}

			colors = ['red','white','black','blue','yellow','green']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
            if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
			switch(command) {
				case 'help':
				case 'menu':
					client.sendMessage(from, help(prefix), text)
					break
				case 'kontak':
                    await client.sendContact(from, ownerNumber)
                break
				case 'info':
					me = client.user
					uptime = process.uptime()
					teks = `*Nama bot* : ${me.name}\n*Nomor Bot* : @${me.jid.split('@')[0]}\n*Prefix* : ${prefix}\n*Total Block Contact* : ${blocked.length}\n*The bot is active on* : ${kyun(uptime)}`
					buffer = await getBuffer(me.imgUrl)
					client.sendMessage(from, buffer, image, {caption: teks, contextInfo:{mentionedJid: [me.jid]}})
					break
				case 'blocklist':
					teks = 'This is list of blocked number :\n'
					for (let block of blocked) {
						teks += `~> @${block.split('@')[0]}\n`
					}
					teks += `Total : ${blocked.length}`
					client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": blocked}})
					break
				
				case 'stiker':
				case 'sticker':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.input(media)
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								reply(mess.error.stick)
							})
							.on('end', function () {
								console.log('Finish')
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
						const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						reply(mess.wait)
						await ffmpeg(`./${media}`)
							.inputFormat(media.split('.')[1])
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unSync(media)
								tipe = media.endsWith('.mp4') ? 'video' : 'gif'
								reply(`❌ Gagal, pada saat mengkonversi ${tipe} ke stiker`)
							})
							.on('end', function () {
								console.log('Finish')
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ranw = getRandom('.webp')
						ranp = getRandom('.png')
						reply(mess.wait)
						keyrmbg = 'Your-ApiKey'
						await removeBackgroundFromImageFile({path: media, apiKey: keyrmbg.result, size: 'auto', type: 'auto', ranp}).then(res => {
							fs.unlinkSync(media)
							let buffer = Buffer.from(res.base64img, 'base64')
							fs.writeFileSync(ranp, buffer, (err) => {
								if (err) return reply('Gagal, Terjadi kesalahan, silahkan coba beberapa saat lagi.')
							})
							exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
								fs.unlinkSync(ranp)
								if (err) return reply(mess.error.stick)
								buff = fs.readFileSync(ranw)
								client.sendMessage(from, buff, sticker, {quoted: mek})
							})
						})
					/*} else if ((isMedia || isQuotedImage) && colors.includes(args[0])) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.on('start', function (cmd) {
								console.log('Started :', cmd)
							})
							.on('error', function (err) {
								fs.unlinkSync(media)
								console.log('Error :', err)
							})
							.on('end', function () {
								console.log('Finish')
								fs.unlinkSync(media)
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=${args[0]}@0.0, split [a][b]; [a] palettegen=reserve_transparent=off; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)*/
					} else {
						reply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`)
					}
					break
				case 'ocr':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						reply(mess.wait)
						await recognize(media, {lang: 'eng+ind', oem: 1, psm: 3})
							.then(teks => {
								reply(teks.trim())
								fs.unlinkSync(media)
							})
							.catch(err => {
								reply(err.message)
								fs.unlinkSync(media)
							})
					} else {
						reply('Foto aja mas')
					}
					break
				case 'igstalk':
					if (args.length < 1) return reply('Username nya?')
					reply(`Mencari`)
					anu = await fetchJson(`https://api.zeks.xyz/api/igstalk?username=${body.slice(8)}&apikey=${zeks}`, {method: 'get'})
					if (anu.false) return reply(anu.message)
					teks = `\n*Username* : ${anu.username}\n*Nama* : ${anu.fullname}\n*Pengikut* : ${anu.follower}\n*Mengikuti* : ${anu.following}\n*Status Akun* : ${anu.is_bussiness}\n*Privasi Akun* : ${anu.is_private}\n*Bio* : ${anu.bio}\n\n*A F S* _BOT_`
					thumb = await getBuffer(anu.profile_pic)
					console.log(`Gambar ${anu.profile_pic}`)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					break
				case 'tts':
					if (args.length < 1) return client.sendMessage(from, 'Kode bahasanya mana om?', text, {quoted: mek})
					const gtts = require('./lib/gtts')(args[0])
					if (args.length < 2) return client.sendMessage(from, 'Textnya mana om', text, {quoted: mek})
					dtt = body.slice(9)
					ranm = getRandom('.mp3')
					rano = getRandom('.ogg')
					dtt.length > 600
					? reply('Textnya kebanyakan om')
					: gtts.save(ranm, dtt, function() {
						exec(`ffmpeg -i ${ranm} -ar 48000 -vn -c:a libopus ${rano}`, (err) => {
							fs.unlinkSync(ranm)
							buff = fs.readFileSync(rano)
							if (err) return reply('Gagal om:(')
							client.sendMessage(from, buff, audio, {quoted: mek, ptt:true})
							fs.unlinkSync(rano)
						})
					})
					break
				/*case 'meme':
					meme = await kagApi.memes()
					buffer = await getBuffer(`https://imgur.com/${meme.hash}.jpg`)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: '.......'})
					break*/
				/*case 'memeindo':
					memein = await kagApi.memeindo()
					buffer = await getBuffer(`https://imgur.com/${memein.hash}.jpg`)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: '.......'})
					break*/
				case 'setprefix':
					if (args.length < 1) return
					if (!isOwner) return reply(mess.only.ownerB)
					prefix = args[0]
					reply(`Prefix berhasil di ubah menjadi : ${prefix}`)
					break
				/*case 'loli':
					loli.getSFWLoli(async (err, res) => {
						if (err) return reply('❌ *ERROR* ❌')
						buffer = await getBuffer(res.url)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Ingat! Citai Lolimu'})
					})
					break
				/*case 'nsfwloli':
					if (!isNsfw) return reply('❌ *FALSE* ❌')
					loli.getNSFWLoli(async (err, res) => {
						if (err) return reply('❌ *ERROR* ❌')
						buffer = await getBuffer(res.url)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Jangan jadiin bahan buat comli om'})
					})
					break*/
				case 'rpaper' :
					const walnime = ['https://cdn.nekos.life/wallpaper/QwGLg4oFkfY.png','https://cdn.nekos.life/wallpaper/bUzSjcYxZxQ.jpg','https://cdn.nekos.life/wallpaper/j49zxzaUcjQ.jpg','https://cdn.nekos.life/wallpaper/YLTH5KuvGX8.png','https://cdn.nekos.life/wallpaper/Xi6Edg133m8.jpg','https://cdn.nekos.life/wallpaper/qvahUaFIgUY.png','https://cdn.nekos.life/wallpaper/leC8q3u8BSk.jpg','https://cdn.nekos.life/wallpaper/tSUw8s04Zy0.jpg','https://cdn.nekos.life/wallpaper/sqsj3sS6EJE.png','https://cdn.nekos.life/wallpaper/HmjdX_s4PU4.png','https://cdn.nekos.life/wallpaper/Oe2lKgLqEXY.jpg','https://cdn.nekos.life/wallpaper/GTwbUYI-xTc.jpg','https://cdn.nekos.life/wallpaper/nn_nA8wTeP0.png','https://cdn.nekos.life/wallpaper/Q63o6v-UUa8.png','https://cdn.nekos.life/wallpaper/ZXLFm05K16Q.jpg','https://cdn.nekos.life/wallpaper/cwl_1tuUPuQ.png','https://cdn.nekos.life/wallpaper/wWhtfdbfAgM.jpg','https://cdn.nekos.life/wallpaper/3pj0Xy84cPg.jpg','https://cdn.nekos.life/wallpaper/sBoo8_j3fkI.jpg','https://cdn.nekos.life/wallpaper/gCUl_TVizsY.png','https://cdn.nekos.life/wallpaper/LmTi1k9REW8.jpg','https://cdn.nekos.life/wallpaper/sbq_4WW2PUM.jpg','https://cdn.nekos.life/wallpaper/QOSUXEbzDQA.png','https://cdn.nekos.life/wallpaper/khaqGIHsiqk.jpg','https://cdn.nekos.life/wallpaper/iFtEXugqQgA.png','https://cdn.nekos.life/wallpaper/deFKIDdRe1I.jpg','https://cdn.nekos.life/wallpaper/OHZVtvDm0gk.jpg','https://cdn.nekos.life/wallpaper/YZYa00Hp2mk.jpg','https://cdn.nekos.life/wallpaper/R8nPIKQKo9g.png','https://cdn.nekos.life/wallpaper/_brn3qpRBEE.jpg','https://cdn.nekos.life/wallpaper/ADTEQdaHhFI.png','https://cdn.nekos.life/wallpaper/MGvWl6om-Fw.jpg','https://cdn.nekos.life/wallpaper/YGmpjZW3AoQ.jpg','https://cdn.nekos.life/wallpaper/hNCgoY-mQPI.jpg','https://cdn.nekos.life/wallpaper/3db40hylKs8.png','https://cdn.nekos.life/wallpaper/iQ2FSo5nCF8.jpg','https://cdn.nekos.life/wallpaper/meaSEfeq9QM.png','https://cdn.nekos.life/wallpaper/CmEmn79xnZU.jpg','https://cdn.nekos.life/wallpaper/MAL18nB-yBI.jpg','https://cdn.nekos.life/wallpaper/FUuBi2xODuI.jpg','https://cdn.nekos.life/wallpaper/ez-vNNuk6Ck.jpg','https://cdn.nekos.life/wallpaper/K4-z0Bc0Vpc.jpg','https://cdn.nekos.life/wallpaper/Y4JMbswrNg8.jpg','https://cdn.nekos.life/wallpaper/ffbPXIxt4-0.png','https://cdn.nekos.life/wallpaper/x63h_W8KFL8.jpg','https://cdn.nekos.life/wallpaper/lktzjDRhWyg.jpg','https://cdn.nekos.life/wallpaper/j7oQtvRZBOI.jpg','https://cdn.nekos.life/wallpaper/MQQEAD7TUpQ.png','https://cdn.nekos.life/wallpaper/lEG1-Eeva6Y.png','https://cdn.nekos.life/wallpaper/Loh5wf0O5Aw.png','https://cdn.nekos.life/wallpaper/yO6ioREenLA.png','https://cdn.nekos.life/wallpaper/4vKWTVgMNDc.jpg','https://cdn.nekos.life/wallpaper/Yk22OErU8eg.png','https://cdn.nekos.life/wallpaper/Y5uf1hsnufE.png','https://cdn.nekos.life/wallpaper/xAmBpMUd2Zw.jpg','https://cdn.nekos.life/wallpaper/f_RWFoWciRE.jpg','https://cdn.nekos.life/wallpaper/Y9qjP2Y__PA.jpg','https://cdn.nekos.life/wallpaper/eqEzgohpPwc.jpg','https://cdn.nekos.life/wallpaper/s1MBos_ZGWo.jpg','https://cdn.nekos.life/wallpaper/PtW0or_Pa9c.png','https://cdn.nekos.life/wallpaper/32EAswpy3M8.png','https://cdn.nekos.life/wallpaper/Z6eJZf5xhcE.png','https://cdn.nekos.life/wallpaper/xdiSF731IFY.jpg','https://cdn.nekos.life/wallpaper/Y9r9trNYadY.png','https://cdn.nekos.life/wallpaper/8bH8CXn-sOg.jpg','https://cdn.nekos.life/wallpaper/a02DmIFzRBE.png','https://cdn.nekos.life/wallpaper/MnrbXcPa7Oo.png','https://cdn.nekos.life/wallpaper/s1Tc9xnugDk.jpg','https://cdn.nekos.life/wallpaper/zRqEx2gnfmg.jpg','https://cdn.nekos.life/wallpaper/PtW0or_Pa9c.png','https://cdn.nekos.life/wallpaper/0ECCRW9soHM.jpg','https://cdn.nekos.life/wallpaper/kAw8QHl_wbM.jpg','https://cdn.nekos.life/wallpaper/ZXcaFmpOlLk.jpg','https://cdn.nekos.life/wallpaper/WVEdi9Ng8UE.png','https://cdn.nekos.life/wallpaper/IRu29rNgcYU.png','https://cdn.nekos.life/wallpaper/LgIJ_1AL3rM.jpg','https://cdn.nekos.life/wallpaper/DVD5_fLJEZA.jpg','https://cdn.nekos.life/wallpaper/siqOQ7k8qqk.jpg','https://cdn.nekos.life/wallpaper/CXNX_15eGEQ.png','https://cdn.nekos.life/wallpaper/s62tGjOTHnk.jpg','https://cdn.nekos.life/wallpaper/tmQ5ce6EfJE.png','https://cdn.nekos.life/wallpaper/Zju7qlBMcQ4.jpg','https://cdn.nekos.life/wallpaper/CPOc_bMAh2Q.png','https://cdn.nekos.life/wallpaper/Ew57S1KtqsY.jpg','https://cdn.nekos.life/wallpaper/hVpFbYJmZZc.jpg','https://cdn.nekos.life/wallpaper/sb9_J28pftY.jpg','https://cdn.nekos.life/wallpaper/JDoIi_IOB04.jpg','https://cdn.nekos.life/wallpaper/rG76AaUZXzk.jpg','https://cdn.nekos.life/wallpaper/9ru2luBo360.png','https://cdn.nekos.life/wallpaper/ghCgiWFxGwY.png','https://cdn.nekos.life/wallpaper/OSR-i-Rh7ZY.png','https://cdn.nekos.life/wallpaper/65VgtPyweCc.jpg','https://cdn.nekos.life/wallpaper/3vn-0FkNSbM.jpg','https://cdn.nekos.life/wallpaper/u02Y0-AJPL0.jpg','https://cdn.nekos.life/wallpaper/_-Z-0fGflRc.jpg','https://cdn.nekos.life/wallpaper/3VjNKqEPp58.jpg','https://cdn.nekos.life/wallpaper/NoG4lKnk6Sc.jpg','https://cdn.nekos.life/wallpaper/xiTxgRMA_IA.jpg','https://cdn.nekos.life/wallpaper/yq1ZswdOGpg.png','https://cdn.nekos.life/wallpaper/4SUxw4M3UMA.png','https://cdn.nekos.life/wallpaper/cUPnQOHNLg0.jpg','https://cdn.nekos.life/wallpaper/zczjuLWRisA.jpg','https://cdn.nekos.life/wallpaper/TcxvU_diaC0.png','https://cdn.nekos.life/wallpaper/7qqWhEF_uoY.jpg','https://cdn.nekos.life/wallpaper/J4t_7DvoUZw.jpg','https://cdn.nekos.life/wallpaper/xQ1Pg5D6J4U.jpg','https://cdn.nekos.life/wallpaper/aIMK5Ir4xho.jpg','https://cdn.nekos.life/wallpaper/6gneEXrNAWU.jpg','https://cdn.nekos.life/wallpaper/PSvNdoISWF8.jpg','https://cdn.nekos.life/wallpaper/SjgF2-iOmV8.jpg','https://cdn.nekos.life/wallpaper/vU54ikOVY98.jpg','https://cdn.nekos.life/wallpaper/QjnfRwkRU-Q.jpg','https://cdn.nekos.life/wallpaper/uSKqzz6ZdXc.png','https://cdn.nekos.life/wallpaper/AMrcxZOnVBE.jpg','https://cdn.nekos.life/wallpaper/N1l8SCMxamE.jpg','https://cdn.nekos.life/wallpaper/n2cBaTo-J50.png','https://cdn.nekos.life/wallpaper/ZXcaFmpOlLk.jpg','https://cdn.nekos.life/wallpaper/7bwxy3elI7o.png','https://cdn.nekos.life/wallpaper/7VW4HwF6LcM.jpg','https://cdn.nekos.life/wallpaper/YtrPAWul1Ug.png','https://cdn.nekos.life/wallpaper/1p4_Mmq95Ro.jpg','https://cdn.nekos.life/wallpaper/EY5qz5iebJw.png','https://cdn.nekos.life/wallpaper/aVDS6iEAIfw.jpg','https://cdn.nekos.life/wallpaper/veg_xpHQfjE.jpg','https://cdn.nekos.life/wallpaper/meaSEfeq9QM.png','https://cdn.nekos.life/wallpaper/Xa_GtsKsy-s.png','https://cdn.nekos.life/wallpaper/6Bx8R6D75eM.png','https://cdn.nekos.life/wallpaper/zXOGXH_b8VY.png','https://cdn.nekos.life/wallpaper/VQcviMxoQ00.png','https://cdn.nekos.life/wallpaper/CJnRl-PKWe8.png','https://cdn.nekos.life/wallpaper/zEWYfFL_Ero.png','https://cdn.nekos.life/wallpaper/_C9Uc5MPaz4.png','https://cdn.nekos.life/wallpaper/zskxNqNXyG0.jpg','https://cdn.nekos.life/wallpaper/g7w14PjzzcQ.jpg','https://cdn.nekos.life/wallpaper/KavYXR_GRB4.jpg','https://cdn.nekos.life/wallpaper/Z_r9WItzJBc.jpg','https://cdn.nekos.life/wallpaper/Qps-0JD6834.jpg','https://cdn.nekos.life/wallpaper/Ri3CiJIJ6M8.png','https://cdn.nekos.life/wallpaper/ArGYIpJwehY.jpg','https://cdn.nekos.life/wallpaper/uqYKeYM5h8w.jpg','https://cdn.nekos.life/wallpaper/h9cahfuKsRg.jpg','https://cdn.nekos.life/wallpaper/iNPWKO8d2a4.jpg','https://cdn.nekos.life/wallpaper/j2KoFVhsNig.jpg','https://cdn.nekos.life/wallpaper/z5Nc-aS6QJ4.jpg','https://cdn.nekos.life/wallpaper/VUFoK8l1qs0.png','https://cdn.nekos.life/wallpaper/rQ8eYh5mXN8.png','https://cdn.nekos.life/wallpaper/D3NxNISDavQ.png','https://cdn.nekos.life/wallpaper/Z_CiozIenrU.jpg','https://cdn.nekos.life/wallpaper/np8rpfZflWE.jpg','https://cdn.nekos.life/wallpaper/ED-fgS09gik.jpg','https://cdn.nekos.life/wallpaper/AB0Cwfs1X2w.jpg','https://cdn.nekos.life/wallpaper/DZBcYfHouiI.jpg','https://cdn.nekos.life/wallpaper/lC7pB-GRAcQ.png','https://cdn.nekos.life/wallpaper/zrI-sBSt2zE.png','https://cdn.nekos.life/wallpaper/_RJhylwaCLk.jpg','https://cdn.nekos.life/wallpaper/6km5m_GGIuw.png','https://cdn.nekos.life/wallpaper/3db40hylKs8.png','https://cdn.nekos.life/wallpaper/oggceF06ONQ.jpg','https://cdn.nekos.life/wallpaper/ELdH2W5pQGo.jpg','https://cdn.nekos.life/wallpaper/Zun_n5pTMRE.png','https://cdn.nekos.life/wallpaper/VqhFKG5U15c.png','https://cdn.nekos.life/wallpaper/NsMoiW8JZ60.jpg','https://cdn.nekos.life/wallpaper/XE4iXbw__Us.png','https://cdn.nekos.life/wallpaper/a9yXhS2zbhU.jpg','https://cdn.nekos.life/wallpaper/jjnd31_3Ic8.jpg','https://cdn.nekos.life/wallpaper/Nxanxa-xO3s.png','https://cdn.nekos.life/wallpaper/dBHlPcbuDc4.jpg','https://cdn.nekos.life/wallpaper/6wUZIavGVQU.jpg','https://cdn.nekos.life/wallpaper/_-Z-0fGflRc.jpg','https://cdn.nekos.life/wallpaper/H9OUpIrF4gU.jpg','https://cdn.nekos.life/wallpaper/xlRdH3fBMz4.jpg','https://cdn.nekos.life/wallpaper/7IzUIeaae9o.jpg','https://cdn.nekos.life/wallpaper/FZCVL6PyWq0.jpg','https://cdn.nekos.life/wallpaper/5dG-HH6d0yw.png','https://cdn.nekos.life/wallpaper/ddxyA37HiwE.png','https://cdn.nekos.life/wallpaper/I0oj_jdCD4k.jpg','https://cdn.nekos.life/wallpaper/ABchTV97_Ts.png','https://cdn.nekos.life/wallpaper/58C37kkq39Y.png','https://cdn.nekos.life/wallpaper/HMS5mK7WSGA.jpg','https://cdn.nekos.life/wallpaper/1O3Yul9ojS8.jpg','https://cdn.nekos.life/wallpaper/hdZI1XsYWYY.jpg','https://cdn.nekos.life/wallpaper/h8pAJJnBXZo.png','https://cdn.nekos.life/wallpaper/apO9K9JIUp8.jpg','https://cdn.nekos.life/wallpaper/p8f8IY_2mwg.jpg','https://cdn.nekos.life/wallpaper/HY1WIB2r_cE.jpg','https://cdn.nekos.life/wallpaper/u02Y0-AJPL0.jpg','https://cdn.nekos.life/wallpaper/jzN74LcnwE8.png','https://cdn.nekos.life/wallpaper/IeAXo5nJhjw.jpg','https://cdn.nekos.life/wallpaper/7lgPyU5fuLY.jpg','https://cdn.nekos.life/wallpaper/f8SkRWzXVxk.png','https://cdn.nekos.life/wallpaper/ZmDTpGGeMR8.jpg','https://cdn.nekos.life/wallpaper/AMrcxZOnVBE.jpg','https://cdn.nekos.life/wallpaper/ZhP-f8Icmjs.jpg','https://cdn.nekos.life/wallpaper/7FyUHX3fE2o.jpg','https://cdn.nekos.life/wallpaper/CZoSLK-5ng8.png','https://cdn.nekos.life/wallpaper/pSNDyxP8l3c.png','https://cdn.nekos.life/wallpaper/AhYGHF6Fpck.jpg','https://cdn.nekos.life/wallpaper/ic6xRRptRes.jpg','https://cdn.nekos.life/wallpaper/89MQq6KaggI.png','https://cdn.nekos.life/wallpaper/y1DlFeHHTEE.png']
					let walnimek = walnime[Math.floor(Math.random() * walnime.length)]
					client.sendFileFromUrl(from, walnimek, 'Nimek.jpg', '', message.id)
					break
				case 'ptl1':
					https://i.pinimg.com/564x/b2/84/55/b2845599d303a4f8fc4f7d2a576799fa.jpg","https://i.pinimg.com/236x/98/08/1c/98081c4dffde1c89c444db4dc1912d2d.jpg","https://i.pinimg.com/236x/a7/e2/fe/a7e2fee8b0abef9d9ecc8885557a4e91.jpg","https://i.pinimg.com/236x/ee/ae/76/eeae769648dfaa18cac66f1d0be8c160.jpg","https://i.pinimg.com/236x/b2/84/55/b2845599d303a4f8fc4f7d2a576799fa.jpg","https://i.pinimg.com/564x/78/7c/49/787c4924083a9424a900e8f1f4fdf05f.jpg","https://i.pinimg.com/236x/eb/05/dc/eb05dc1c306f69dd43b7cae7cbe03d27.jpg","https://i.pinimg.com/236x/d0/1b/40/d01b40691c68b84489f938b939a13871.jpg","https://i.pinimg.com/236x/31/f3/06/31f3065fa218856d7650e84b000d98ab.jpg","https://i.pinimg.com/236x/4a/e5/06/4ae5061a5c594d3fdf193544697ba081.jpg","https://i.pinimg.com/236x/56/45/dc/5645dc4a4a60ac5b2320ce63c8233d6a.jpg","https://i.pinimg.com/236x/7f/ad/82/7fad82eec0fa64a41728c9868a608e73.jpg","https://i.pinimg.com/236x/ce/f8/aa/cef8aa0c963170540a96406b6e54991c.jpg","https://i.pinimg.com/236x/77/02/34/77023447b040aef001b971e0defc73e3.jpg","https://i.pinimg.com/236x/4a/5c/38/4a5c38d39687f76004a097011ae44c7d.jpg","https://i.pinimg.com/236x/41/72/af/4172af2053e54ec6de5e221e884ab91b.jpg","https://i.pinimg.com/236x/26/63/ef/2663ef4d4ecfc935a6a2b51364f80c2b.jpg","https://i.pinimg.com/236x/2b/cb/48/2bcb487b6d398e8030814c7a6c5a641d.jpg","https://i.pinimg.com/236x/62/da/23/62da234d941080696428e6d4deec6d73.jpg","https://i.pinimg.com/236x/d4/f3/40/d4f340e614cc4f69bf9a31036e3d03c5.jpg","https://i.pinimg.com/236x/d4/97/dd/d497dd29ca202be46111f1d9e62ffa65.jpg","https://i.pinimg.com/564x/52/35/66/523566d43058e26bf23150ac064cfdaa.jpg","https://i.pinimg.com/236x/36/e5/27/36e52782f8d10e4f97ec4dbbc97b7e67.jpg","https://i.pinimg.com/236x/02/a0/33/02a033625cb51e0c878e6df2d8d00643.jpg","https://i.pinimg.com/236x/30/9b/04/309b04d4a498addc6e4dd9d9cdfa57a9.jpg","https://i.pinimg.com/236x/9e/1d/ef/9e1def3b7ce4084b7c64693f15b8bea9.jpg","https://i.pinimg.com/236x/e1/8f/a2/e18fa21af74c28e439f1eb4c60e5858a.jpg","https://i.pinimg.com/236x/22/d9/22/22d9220de8619001fe1b27a2211d477e.jpg","https://i.pinimg.com/236x/af/ac/4d/afac4d11679184f557d9294c2270552d.jpg","https://i.pinimg.com/564x/52/be/c9/52bec924b5bdc0d761cfb1160865b5a1.jpg","https://i.pinimg.com/236x/1a/5a/3c/1a5a3cffd0d936cd4969028668530a15.jpg
					let pep = pptl[Math.floor(Math.random() * pptl.length)]
					tobz.sendFileFromUrl(from, pep, 'pptl.jpg', 'Follow ig : https://www.instagram.com/ptl_repost untuk mendapatkan penyegar timeline lebih banyak', message.id)
					break
				case 'ptl':
					reply(mess.wait)
					anu = await fetchJson(`https://i.pinimg.com/564x/b2/84/55/b2845599d303a4f8fc4f7d2a576799fa.jpg","https://i.pinimg.com/236x/98/08/1c/98081c4dffde1c89c444db4dc1912d2d.jpg","https://i.pinimg.com/236x/a7/e2/fe/a7e2fee8b0abef9d9ecc8885557a4e91.jpg","https://i.pinimg.com/236x/ee/ae/76/eeae769648dfaa18cac66f1d0be8c160.jpg","https://i.pinimg.com/236x/b2/84/55/b2845599d303a4f8fc4f7d2a576799fa.jpg","https://i.pinimg.com/564x/78/7c/49/787c4924083a9424a900e8f1f4fdf05f.jpg","https://i.pinimg.com/236x/eb/05/dc/eb05dc1c306f69dd43b7cae7cbe03d27.jpg","https://i.pinimg.com/236x/d0/1b/40/d01b40691c68b84489f938b939a13871.jpg","https://i.pinimg.com/236x/31/f3/06/31f3065fa218856d7650e84b000d98ab.jpg","https://i.pinimg.com/236x/4a/e5/06/4ae5061a5c594d3fdf193544697ba081.jpg","https://i.pinimg.com/236x/56/45/dc/5645dc4a4a60ac5b2320ce63c8233d6a.jpg","https://i.pinimg.com/236x/7f/ad/82/7fad82eec0fa64a41728c9868a608e73.jpg","https://i.pinimg.com/236x/ce/f8/aa/cef8aa0c963170540a96406b6e54991c.jpg","https://i.pinimg.com/236x/77/02/34/77023447b040aef001b971e0defc73e3.jpg","https://i.pinimg.com/236x/4a/5c/38/4a5c38d39687f76004a097011ae44c7d.jpg","https://i.pinimg.com/236x/41/72/af/4172af2053e54ec6de5e221e884ab91b.jpg","https://i.pinimg.com/236x/26/63/ef/2663ef4d4ecfc935a6a2b51364f80c2b.jpg","https://i.pinimg.com/236x/2b/cb/48/2bcb487b6d398e8030814c7a6c5a641d.jpg","https://i.pinimg.com/236x/62/da/23/62da234d941080696428e6d4deec6d73.jpg","https://i.pinimg.com/236x/d4/f3/40/d4f340e614cc4f69bf9a31036e3d03c5.jpg","https://i.pinimg.com/236x/d4/97/dd/d497dd29ca202be46111f1d9e62ffa65.jpg","https://i.pinimg.com/564x/52/35/66/523566d43058e26bf23150ac064cfdaa.jpg","https://i.pinimg.com/236x/36/e5/27/36e52782f8d10e4f97ec4dbbc97b7e67.jpg","https://i.pinimg.com/236x/02/a0/33/02a033625cb51e0c878e6df2d8d00643.jpg","https://i.pinimg.com/236x/30/9b/04/309b04d4a498addc6e4dd9d9cdfa57a9.jpg","https://i.pinimg.com/236x/9e/1d/ef/9e1def3b7ce4084b7c64693f15b8bea9.jpg","https://i.pinimg.com/236x/e1/8f/a2/e18fa21af74c28e439f1eb4c60e5858a.jpg","https://i.pinimg.com/236x/22/d9/22/22d9220de8619001fe1b27a2211d477e.jpg","https://i.pinimg.com/236x/af/ac/4d/afac4d11679184f557d9294c2270552d.jpg","https://i.pinimg.com/564x/52/be/c9/52bec924b5bdc0d761cfb1160865b5a1.jpg","https://i.pinimg.com/236x/1a/5a/3c/1a5a3cffd0d936cd4969028668530a15.jpg`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'anjing':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/tools/dog?key={apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'slap':
					arg = body.trim().split(' ')
					const person = author.replace('@c.us', '')
					await client.sendGiphyAsSticker(from, 'https://media.giphy.com/media/S8507sBJm1598XnsgD/source.gif')
					client.sendTextWithMentions(from, '@' + person + ' *slapped* ' + arg[1])
					break
		        case 'translate':
					if (args.length < 1) return reply('Kode Bahasanya ngab?')
					if (args.length < 1) return reply('Teksnya mana Ngab?')
					argz = body.trim().split(' ')
					const bahasatrans = argz[1]
					const katatrans = argz[2]
					anu = await fetchJson(`https://arugaz.my.id/api/edu/translate?lang=${bahasatrans}&text=${katatrans}`, {method: 'get'})
					reply(anu.text)
					break
				case 'cuaca':
					if (args.length < 1) return reply('Teksnya mana um?')
					anu = await fetchJson(`https://api.i-tech.id/tools/cuaca?key=zzfmy1-dEzUYu-bTzKfs-mWOVri-blrNBe&kota=${body.slice(7)}`, {method: 'get'})
					reply(`Tempat:${anu.tempat}\nCuaca:${anu.cuaca}\nDeskripsi:${anu.deskripsi}\nSuhu:${anu.Suhu}\nKelembapan:${anu.kelembapan}\nUdara:${anu.udara}\nAngin:${anu.angin}\n\n\nA F S BOT`)
					break
				case 'hilih':
					if (args.length < 1) return reply('Teksnya mana Ngab?')
					anu = await fetchJson(`http://enznoire.herokuapp.com/hilih?kata=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'mimpi':
					if (args.length < 1) return reply('Teksnya mana Ngab?')
					anu = await fetchJson(`https://arugaz.my.id/api/primbon/tafsirmimpi?mimpi=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'font':
					if (args.length < 1) return reply('Teksnya mana Ngab?')
					anu = await fetchJson(`https://arugaz.my.id/api/random/text/fancytext?text=${body.slice(6)}`, {method: 'get'})
					reply(`Nih\n\n${anu.result}`)
					break
				case 'alay':
					if (args.length < 1) return reply('Teksnya mana Ngab?')
					anu = await fetchJson(`https://api.zeks.xyz/api/alaymaker?kata=${body.slice(5)}&apikey=${zeks}`, {method: 'get'})
					reply(anu.result)
					break
				case 'kbbi':
					if (args.length < 1) return reply('Teksnya mana um?')
					anu = await fetchJson(`http://enznoire.herokuapp.com/kbbi?kata=${body.slice(5)}`, {method: 'get'})
					reply(anu.data.result)
					break
				case 'shorturl':
					if (args.length < 1) return reply('Teksnya mana um?')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/bitly?url=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				
				case 'playmp3':
					if (args.length < 1) return reply('Judulnya?')
					reply(`Mencari`)
					anu = await fetchJson(`https://api.zeks.xyz/api/ytplaymp3?q={body.slice(6)}&apikey=${zeks}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `Ditemukan\n\n*Title* : ${anu.result.title}\n*Source* : ${anu.result.source}\nFile Audio Sedang Diproses\n\n*A F S* _BOT_`
					thumb = await getBuffer(anu.result.thumbnail)
					console.log(`Gambar${anu.result.thumbnail}`)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					buffer = await getBuffer(anu.result.url_audio)
					console.log(anu.result.url_audio)
					client.sendMessage(from, buffer, audio, {mimetype: 'audio/mp4', filename: `${anu.title}.mp3`, quoted: mek})
					break
				case 'playmp4':
					if (args.length < 1) return reply('Judulnya?')
					reply(`Mencari`)
					anu = await fetchJson(`https://api.zeks.xyz/api/ytplaymp3?q={body.slice(8)}&apikey=${zeks}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `Ditemukan\n\n*Title* : ${anu.result.title}\n*Source* : ${anu.result.source}\nFile Video Sedang Diproses\n\n*A F S* _BOT_`
					thumb = await getBuffer(anu.result.thumbnail)
					console.log(`Gambar${anu.result.thumbnail}`)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					buffer = await getBuffer(anu.result.url_video)
					console.log(anu.result.url_video)
					client.sendMessage(from, buffer, video, {mimetype: 'video/mp4', filename: `${anu.title}.mp4`, quoted: mek})
					break
				case 'randomquran':
					anu = await fetchJson(`https://api.zeks.xyz/api/randomquran`, {method: 'get'})
					teks = `*Arab :* ${anu.result.asma}\n*Surah :* ${anu.result.nama}\n*Arti :* ${anu.result.arti}\n*Diturunkan :* ${anu.result.type}\n*Surah ke :* ${anu.result.nomor}\n*Ayat :* ${anu.result.ayat}\n*Keterangan :* ${anu.result.keterangan}\n\n*A F S* _BOT_`
					console.log(`teks`)
					reply(teks)
					buffer = await getBuffer(anu.result.audio)
					console.log(anu.result.audio)
					client.sendMessage(from, buffer, audio, {mimetype: 'audio/mp4', filename: `${anu.result.nama}.mp3`, quoted: mek})
					break
				case 'ytmp4':
					if (args.length < 1) return reply('Judulnya?')
					anu = await fetchJson(`https://api.zeks.xyz/api/ytmp4?url=${args[1]}&apikey=${zeks}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `Ditemukan\n\n*Judul* : ${anu.result.title}\n*Ukuran* : ${anu.result.size}\n*Link Download* : ${anu.result.url_video}\n\n*A F S* _BOT_`
					thumb = await getBuffer(anu.result.thumbnail)
					console.log(`Gambar${anu.result.thumbnail}`)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					break
				case 'tiktok':
					if (args.length < 1) return reply('Judulnya?')
					anu = await fetchJson(`https://arugaz.my.id/api/media/tiktok?url=${body.slice(8)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `*Judul* : ${anu.result.textInfo}\n*Nama* : ${anu.result.nameInfo}\n*Dipublikasikan* : ${anu.result.timeInfo}\n\n*A F S* _BOT_`
					thumb = await getBuffer(anu.result.image)
					console.log(`Gambar${anu.result.image}`)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					buffer = await getBuffer(anu.result.mp4direct)
					console.log(`hasil ${anu.result.mp4direct}`)
					client.sendMessage(from, buffer, video, {mimetype: 'video/mp4', filename: 'ardan.mp4', quoted: mek})
					break
                case 'fb':
					if (args.length < 1) return reply('link?')
					anu = await fetchJson(`https://arugaz.my.id/api/media/facebook?url=${body.slice(4)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buffer = await getBuffer(anu.result.linkHD)
					console.log(`hasil ${anu.result.linkHD}`)
					client.sendMessage(from, buffer, video, {mimetype: 'video/mp4', filename: 'ardan.mp4', quoted: mek})
					break
					break
				case 'vtwt':
					if (args.length < 1) return reply('Linknya?')
					anu = await fetchJson(`https://arugaz.my.id/api/media/twvid?url=${body.slice(5)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					vtwtname = 'AFSBOT'
					buffer = await getBuffer(anu.result.videos)
					console.log(`hasil ${anu.result.videos}`)
					client.sendMessage(from, buffer, video, {mimetype: 'video/mp4', filename: `${vtwtname}.mp4`, quoted: mek})
					break
				case 'vig':
					if (args.length < 1) return reply('Judulnya?')
					anu = await fetchJson(`https://arugaz.my.id/api/media/ig?url=${args[1]}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.url)
					client.sendMessage(from, buff, video, {mimetype: 'video/mp4', filename: `dan.mp4`, quoted: mek})
					break
				case 'dancoba':
					if (args.length < 1) return reply('Urlnya mana um?')
					jar = await getBuffer(`http://api.kocakz.xyz/api/media/ytmus?url=${args[1]}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `*Title* : ${jar.titleInfo}`
					thumb = await getBuffer(jar.getImages)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					buffer = await getBuffer(jar.getAudio)
					client.sendMessage(from, buffer, audio, {mimetype: 'audio', filename: `${jar.titleInfo}.mp3`, quoted: mek})
					break
				/*case 'ytsearch':
					if (args.length < 1) return reply('Yang mau di cari apaan? titit?')
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/ytsearch?q=${body.slice(10)}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = '=================\n'
					for (let i of anu.result) {
						teks += `*Title* : ${i.title}\n*Id* : ${i.id}\n*Published* : ${i.publishTime}\n*Duration* : ${i.duration}\n*Views* : ${h2k(i.views)}\n=================\n`
					}
					reply(teks.trim())
					break*/
				/*case 'tiktok':
					if (args.length < 1) return reply('Urlnya mana um?')
					if (!isUrl(args[0]) && !args[0].includes('tiktok.com')) return reply(mess.error.Iv)
					reply(mess.wait)
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/tiktok?url=${args[0]}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buffer = await getBuffer(anu.result)
					client.sendMessage(from, buffer, video, {quoted: mek})
					break*/
				/*case 'tiktokstalk':
					try {
						if (args.length < 1) return client.sendMessage(from, 'Usernamenya mana um?', text, {quoted: mek})
						let { user, stats } = await tiktod.getUserProfileInfo(args[0])
						reply(mess.wait)
						teks = `*ID* : ${user.id}\n*Username* : ${user.uniqueId}\n*Nickname* : ${user.nickname}\n*Followers* : ${stats.followerCount}\n*Followings* : ${stats.followingCount}\n*Posts* : ${stats.videoCount}\n*Luv* : ${stats.heart}\n`
						buffer = await getBuffer(user.avatarLarger)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: teks})
					} catch (e) {
						console.log(`Error :`, color(e,'red'))
						reply('Kemungkinan username tidak valid')
					}
					break*/
				
				/*case 'url2img':
					tipelist = ['desktop','tablet','mobile']
					if (args.length < 1) return reply('Tipenya apa um?')
					if (!tipelist.includes(args[0])) return reply('Tipe desktop|tablet|mobile')
					if (args.length < 2) return reply('Urlnya mana um?')
					if (!isUrl(args[1])) return reply(mess.error.Iv)
					reply(mess.wait)
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/url2image?tipe=${args[0]}&url=${args[1]}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek})
					break*/
				/*case 'tstiker':
				case 'tsticker':
					if (args.length < 1) return reply('Textnya mana um?')
					ranp = getRandom('.png')
					rano = getRandom('.webp')
					teks = body.slice(9).trim()
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/text2image?text=${teks}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					exec(`wget ${anu.result} -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
						fs.unlinkSync(ranp)
						if (err) return reply(mess.error.stick)
						buffer = fs.readFileSync(rano)
						client.sendMessage(from, buffer, sticker, {quoted: mek})
						fs.unlinkSync(rano)
					})
					break*/
				case "revoke":
	            if (!isGroupAdmins) return reply(from, ']perintah ini hanya bisa di gunakan admin', id)
                    if (isGroupAdmins) {
                        client
                        .revokeGroupInviteLink(from)
                            .then((res) => {
                                reply(from, `Berhasil Revoke Grup Link gunakan l*${prefix}grouplink* untuk mendapatkan group invite link yang terbaru`, id);
                            })
                            .catch((err) => {
                                console.log(`[ERR] ${err}`);
                            });
                    }
            break
				case 'tagall':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					members_id = []
					teks = (args.length > 1) ? body.slice(8).trim() : ''
					teks += '\n\n'
					for (let mem of groupMembers) {
						teks += `*#* @${mem.jid.split('@')[0]}\n`
						members_id.push(mem.jid)
					}
					mentions(teks, members_id, true)
					break
				case 'ktagall':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					members_id = []
					teks = (args.length > 1) ? body.slice(8).trim() : ''
					teks += '\n\n'
					for (let mem of groupMembers) {
						teks += `${body.slice(9)}\n\n*#* @${mem.jid.split('@')[0]}\n`
						members_id.push(mem.jid)
					}
					mentions(teks, members_id, true)
					break
				case 'clearall':
					if (!isOwner) return reply('Kamu siapa?')
					anu = await client.chats.all()
					client.setMaxListeners(25)
					for (let _ of anu) {
						client.deleteChat(_.jid)
					}
					reply('Sukses delete all chat :)')
					break
				case 'bc':
					if (!isOwner) return reply('Kamu siapa?')
					if (args.length < 1) return reply('.......')
					anu = await client.chats.all()
					if (isMedia && !mek.message.videoMessage || isQuotedImage) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						buff = await client.downloadMediaMessage(encmedia)
						for (let _ of anu) {
							client.sendMessage(_.jid, buff, image, {caption: `[ Ini Broadcast ]\n\n${body.slice(4)}`})
						}
						reply('Suksess broadcast')
					} else {
						for (let _ of anu) {
							sendMess(_.jid, `[ Ini Broadcast ]\n\n${body.slice(4)}`)
						}
						reply('Suksess broadcast')
					}
					break
				case 'add':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (args.length < 1) return reply('Yang mau di add jin ya?')
					if (args[0].startsWith('08')) return reply('Gunakan kode negara mas')
					try {
						num = `${args[0].replace(/ /g, '')}@s.whatsapp.net`
						client.groupAdd(from, [num])
					} catch (e) {
						console.log('Error :', e)
						reply('Gagal menambahkan target, mungkin karena di private')
					}
					break
				case 'jurus':
				    if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag target yang ingin di jurus!')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Perintah di terima, mengeluarkan :\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(teks, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Perintah di terima, mengeluarkan : @${mentioned[0].split('@')[0]}`, mentioned, true)
						client.groupRemove(from, mentioned)
					}
					if (args[0].startsWith('08')) return reply('Gunakan kode negara mas')
					try {
						num = `@${mentioned[0].split('@')[0]}`
						client.groupAdd(from, [num])
					} catch (e) {
						console.log('Error :', e)
						reply('Gagal menambahkan target, mungkin karena di private')
					}
					break
					break
				case 'tess':
				    client.sendMessage(from, help(prefix),text, {
					contexinfo: {
					participant : '0@s.whatsapp.net'
					quotedMessage: {
					conversation: 'AFS VERIVED'
					}
					}
					})
					break
				case 'kick':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mentionedJidList[0] === botNumber) return await aruga.reply(from, 'Maaf, format pesan salah.\nTidak dapat mengeluarkan akun bot sendiri', id)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag target yang ingin di tendang!')
					if (mek.message.extendedTextMessage === botNumber ) return reply('Tidak Bisa Kick Bot!')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Perintah di terima, mengeluarkan :\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(teks, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Perintah di terima, mengeluarkan : @${mentioned[0].split('@')[0]}`, mentioned, true)
						client.groupRemove(from, mentioned)
					}
					break
				case 'listadmins':
					if (!isGroup) return reply(mess.only.group)
					teks = `List admin of group *${groupMetadata.subject}*\nTotal : ${groupAdmins.length}\n\n`
					no = 0
					for (let admon of groupAdmins) {
						no += 1
						teks += `[${no.toString()}] @${admon.split('@')[0]}\n`
					}
					mentions(teks, groupAdmins, true)
					break
				case 'grup':
					case 'group':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (args[0] === 'buka') {
					    reply(`done`)
						client.groupSettingChange(from, GroupSettingChange.messageSend, false)
					} else if (args[0] === 'tutup') {
						reply(`done`)
						client.groupSettingChange(from, GroupSettingChange.messageSend, true)
					}
					break
				case 'setname':
                if (!isGroup) return reply(mess.only.group)
			    if (!isGroupAdmins) return reply(mess.only.admin)
				if (!isBotGroupAdmins) return reply(mess.only.Badmin)
                client.groupUpdateSubject(from, `${body.slice(9)}`)
                client.sendMessage(from, 'Succes, Ganti Nama Grup', text, {quoted: mek})
                break
                case 'setdesc':
                if (!isGroup) return reply(mess.only.group)
			    if (!isGroupAdmins) return reply(mess.only.admin)
				if (!isBotGroupAdmins) return reply(mess.only.Badmin)
                client.groupUpdateDescription(from, `${body.slice(9)}`)
                client.sendMessage(from, 'Succes, Ganti Deskripsi Grup', text, {quoted: mek})
                break
				case 'promote':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Berhasil Promote\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(from, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Berhasil Promote @${mentioned[0].split('@')[0]} Sebagai Admin Group!`, mentioned, true)
						client.groupMakeAdmin(from, mentioned)
					}
					break
				case 'demote':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Berhasil Demote\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(teks, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Berhasil Demote @${mentioned[0].split('@')[0]} Menjadi Member Group!`, mentioned, true)
						client.groupDemoteAdmin(from, mentioned)
					}
					break
				case 'tagall2':
					members_id = []
					teks = (args.length > 1) ? body.slice(8).trim() : ''
					teks += '\n\n'
					for (let mem of groupMembers) {
						teks += `╠➥ @${mem.jid.split('@')[0]}\n`
						members_id.push(mem.jid)
					}
					reply(teks)
					break
                                case 'tagall3':
					members_id = []
					teks = (args.length > 1) ? body.slice(8).trim() : ''
					teks += '\n\n'
					for (let mem of groupMembers) {
						teks += `╠➥ https://wa.me/${mem.jid.split('@')[0]}\n`
						members_id.push(mem.jid)
					}
					client.sendMessage(from, teks, text, {detectLinks: false, quoted: mek})
					break
				case 'toimg':
					if (!isQuotedSticker) return reply('❌ reply stickernya um ❌')
					reply(mess.wait)
					encmedia = JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo
					media = await client.downloadAndSaveMediaMessage(encmedia)
					ran = getRandom('.png')
					exec(`ffmpeg -i ${media} ${ran}`, (err) => {
						fs.unlinkSync(media)
						if (err) return reply('❌ Gagal, pada saat mengkonversi sticker ke gambar ❌')
						buffer = fs.readFileSync(ran)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: '>//<'})
						fs.unlinkSync(ran)
					})
					break
				/*case 'simi':
					if (args.length < 1) return reply('Textnya mana um?')
					teks = body.slice(5)
					anu = await simih(teks) //fetchJson(`https://mhankbarbars.herokuapp.com/api/samisami?text=${teks}`, {method: 'get'})
					//if (anu.error) return reply('Simi ga tau kak')
					reply(anu)
					break*/
				/*case 'simih':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isSimi) return reply('Mode simi sudah aktif')
						samih.push(from)
						fs.writeFileSync('./src/simi.json', JSON.stringify(samih))
						reply('Sukses mengaktifkan mode simi di group ini ✔️')
					} else if (Number(args[0]) === 0) {
						samih.splice(from, 1)
						fs.writeFileSync('./src/simi.json', JSON.stringify(samih))
						reply('Sukes menonaktifkan mode simi di group ini ✔️')
					} else {
						reply('1 untuk mengaktifkan, 0 untuk menonaktifkan')
					}
					break*/
				const terima1 = santet[Math.floor(Math.random() * (santet.length))]
				//random teks
                case 'quotes':
				    anu = await fetchJson(`https://arugaz.herokuapp.com/api/randomquotes`)
					reply(`${anu.quotes}\n\n-${anu.author}`)
					break
				case 'gempa':
				    anu = await fetchJson(`https://tobz-api.herokuapp.com/api/infogempa?apikey=${tobz}`)
					teks =`l*Waktu:* ${anu.waktu}\n\n*Lokasi:* ${anu.lokasi}\n*Koordinat:* ${anu.koordinat}\n*Magnitude:* ${anu.magnitude} SR\n*Kedalaman:* ${anu.kedalaman}\n*Daerah Terdampak:* ${anu.potensi}\n\n*A F S* _BOT_`)
					thumb = await getBuffer(anu.map)
					console.log(`Gambar${anu.map}`)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					break
				case 'howgay':
				    anu = await fetchJson(`https://arugaz.herokuapp.com/api/howgay`)
					reply(`Dia Gay ${anu.persen}%\n-${anu.desc}`)
					break
				case 'pantun':
				    anu = await fetchJson(`https://api.i-tech.id/tools/pantun?key=zzfmy1-dEzUYu-bTzKfs-mWOVri-blrNBe`)
					reply(`nih\n\n${anu.result}`)
					break
				case 'renungan':
				    anu = await fetchJson(`https://docs-jojo.herokuapp.com/api/renungan`)
					reply(`*Judul:* ${anu.judul}\n*Isi:* ${anu.isi}`)
					break
				case 'alkitab':
				    anu = await fetchJson(`https://docs-jojo.herokuapp.com/api/alkitab`)
					teks = `*Isi:* ${anu.result.isi}\n*Ayat:* ${anu.result.ayat}\n*Link:* ${anu.result.link}`
					buff = await getBuffer(anu.result.img)
					client.sendMessage(from, buff, image, {quoted: mek, caption: teks})
					break
				case 'nicknameepep':
				    anu = await fetchJson(`https://api.zeks.xyz/api/nickepep?apikey=${zeks}`)
					reply(`nih\n\n${anu.result}`)
					break
				case 'yts':
				    anu = await fetchJson(`https://api.zeks.xyz/api/yts?q=${body.slice(4)}&apikey=${zeks}`)
					reply(`${anu.result}`)
					break
				
				case 'cekkey':
				    if (!isOwner) return reply('Kowe Sopo?')
				    anu = await fetchJson(`https://api.zeks.xyz/api/cekkey?apikey=${zeks}`)
					reply(`nih Info ApiKey Bot Ini\n\n${anu.message"}\n${anu.limit_key"}\n\n*A F S* _BOT_`)
					break
				case 'statusbapack':
				    let kata1 = [
					    'Kenapa habis huruf T terus U?karena setiap Tahlilan pasti bapack bapack ngincernya Udud Xixixi -Merasa bahagia',
						'Pack saya punya tebakan, Menu menu apa yang bikin bahagia? Jawabannya menua bersama pack Rizal xixixi',
						'PaK kAlaU kiTa mEnGAlamI hAl yAnG pERnaH kITa miMPiin. ItU nAmAnya de facto yA? -mErASa De fAcTO',
,						'Saya maren beli jamur. Barusan saya liat jamurnya jadi jamuran pack. Kalo saya kasi obat jamur, yang ilang jamurnya atau jamurnya ya? #feelingLieur',
						'Sudah berbuat baik hari ini? Tadi saya nemu duit di jalan & saya masukin ke kotak amal. Abis itu kotak amalnya saya bawa pulang.',
						'iNfO LokEr Don|< b4p4cK², kErJa aPa aJ4 gApAp4 4sAL jAn9aN jAdi cOpEt',
						'Pack, KeNaPa MarK ZuckeRberg biKin fAceBooK? ya soalnYa kAlo biKin bEsar daN panJanG itu MarK uRut. xixixi - merasa bEsaR',
						'Sapi, sapi apa yg bisa nempel di dinding?? Jawabannya... Sapidermen',
						'AyAm aYaM Apa YanG LuAs? AyAm SeMesTa xixixi',
						'BapAck dAn boeNda... ApakAh maSih ada yanG sEkoLah???? #merasa_kepo',
						'IkAn apA yaNg biSa tErbaNg HaYo??? sAya Aja gAk taU maKanYa tAnYa pAck xixixi',
						'Bapack bapack tau ga kalo  Bruce Lee jago banget  soalnya gapernah  minum water.. Dia minumnya Watttaaaaaaaaa',
						'TelEtabiEs kalAu baNgun kEsiaNgan jAdi aPa paCk? TeLatabieS xixixi',
						'Pqck,BUah,BuAH apA yanG DurhaKq?JawAbqnNyA BuqH MEl0n. MeLoN KuNdqNG.Xixixixi -Merasa Lucu',
						'Kenapa habis huruf T terus U?karena setiap Tahlilan pasti bapack bapack ngincernya Udud Xixixi -Merasa bahagia',
						'Buat pack riski balikin mejikom saya pack is3 saya udah 3 hari ini gak masak saya lapar pack, kalo niat ngajak duel saya ayok pack',
						'pAcK sAyA tAdI kEpAsAr bELi CeKeR aYaM 10KiLo tApi kOk yAnG jUaLaN mArAh yA, pAdaHaL sAyA cUmAn MinTa dIpIliHin yAnG kAkI kAnAn AjA pAcK -MeRaSA kEsAl-',
						'bapak2 ini kenapa banyak yg posting pare ya? kasian bure pak',
						'Pack k4l0 ultr4m4n 1nguSan JadI Apa? Ultr4fLu xixixi ngakak abiezz',
						'Kenapa tawon seringkali menang ketika menyengat manusia ? Karna kalo kalah namanya talose.',
						'pack tau spare part motor yg selalu sibuk ga? busi xixixi',
						'Cewek : ±300k make up+skincare perbulan, Cowok : 25k rokok+kopi perhari, 25k×30hari=750 perbulan, Jadi,siapa yang boros packx ?xixixi',
						'Bapack-bapack, Gang kita ditantangin sparing krambol sama Gang sebelah.',
						'PAck sAYa uLanG tahUN niChh, ucAPin seSuatU dONg bApACk BapACk seKaLiaN xixixi... -merasa bahagia',
						'Rumahnya boenda himawari ada apa ya? Kok rame banget -Merasa pengen tau',
						'Sendi..sendi apa yg menakutkan pack?? : (SENDI..riannn) -ngakak pooolll',
						'BP4ak2 di c ni taU G4k mUsuHny4 P0l1TikuS? yA itU sI PoLiKUcing -meR4sa s3n4anG'
						'Selamt mlm smua x,, makan Bayam itu lebih nikmat jika sambil makan ayam ,,, kenapa?!?!? Karena kalo g pake ayam jadi x B aja,,',
						'Pack apa bener kalo isac newtoon lagi S3d1H n4M4 nY4 jaDi 1S4C T4n9is xixixixixi, Merasa bingung',
						'coba teback pack jeruck, jeruk apa yg suka ketawa?? jwban.x jeruk LMAO xixixi',
						'Pack Bapack, Ada Lowongan Nih. Syaratnya - Laki Laki - Bersifat Galak Pemarah Dan Omongannya Pedes',
						'mObIL, mObIL aPa yAnG sUkA mAlU? mObiLaNg sAyaNk kE bOenDa Himawari xixixixi 🤫🤭 -Merasa Malu',
						'PaCk,.. buLu buLu apH yaNk wRna nx kuninx? BuLuBenDx,,.. Xixixi nGaK4k abiieeZzZz,,..!!',
						'NumPaNg tnYa bpAck bPack, kNp yA GajAh bHs ingGris nyA eLephant, KenApa ga OnlyG aja....',
						'Pak ank saya mau beli sepeda lipet yang Ada giginya itu gigi nya Asli atau palsu y pak?',
						'Bapac Awaludin jngan lupa ronda, dan bapac-bapac jngan lupa ngronda malam nie yaa. Biyar sya ajah yanc drumah 😀',
						'aRtiS yG cLaLu nGiRiM sUrAT eLeKtrOniK "SAIFUL GMAIL"',
						'PoK AmE AmE BeLaLanG KuPu KupU SiAng MakaN NaSi KaLo nO wa KaMu BeRapA?',
						'Pack supri...  Tolong yah pack..  Kalo mau karokean suaranya jangan keras2.. Musik lari ke timur suara bapack lari ke utara, anak saya dari sore dah menangis pack supri..  Sudah 7 album pack supri menyanyi...  Insaf pack...',
						'Si supri jago kayang, Si Dodit pura-pura mati, Setiap hari mikirin utang, Sampai tak jumpa pujaan hati      -merasa kesepian☹😥😥',
						'Bingung saya mau beli mobil atau rumah soalnya duitnya gak ada😭😭😭',
						'nyesel saya tanya sama pak Rizki katanya kalau buku nikah hilang suruh nikah lagi pas saya bilang ke is3 malah marah² ke saya buat pak Rizki saya tunggu kualifikasi nya di rumah pak erte',
						'Jenis batuan yg tidak pernah merasa bahagia? Batuan sedihmen',
						'P4ck K0p! Nya tak sRuPuT dUlu ya ??',
						'PaCK ApA iYA KaL0 mO PoeLan9 k@mp03NG hAruS diArg3nTiNA dUlU 14 h@R! #MerAsA BinGuNG',
						'BuAh bUaH Apa yAnG LuCu jAwaBanNyA BuAhahaH-nGaKak AbiEzZ😂',
						'Pack Nasi Bebek biSa jaDi ga Enak kaLau tidak ada HuRuf B nya xixixi',
						'PaCk, gaJAh GAjah apA yanG kaKInyA 2? Jaw4BanNyA : Gajah Mada, xixixi -M3raSa lucu sE X pack',
						'PaCk S4ya kan JuAlan SAte, CeRitanYa aDa Bu RizkY mAu Beli, TrUs Bu RizkY BlLaNg giNi, "Mas 10 tuSukan aja Yach" ~MeRaSa kAgeat Xixixiiixii',
						'PaCk SaYa AdA pErtAnyAaN NiCH... BuaCh Buach apA yanG PaLinG mAHall? BuAch Apple, CkCkCkCkAkA -Merasa Lucu',
						'DiMohoN unTuK pAck BuDi diSUruH saMa PacK heRmAN gaNtiiN bUruNgnyA yAng hiLanG keMarEn yA pAck',
						'PaCk kaLo kiTa KeluAr dAri GruP iNi aPakAh BakaLan daPet PesaNgon?',
						'Bpack Bapack Saya Mau nanya Nich SaOs aPa YaNg HarGanyA mAhall?? Jawabannya: S4os BeLi BiS Xixixiix -Merasa Senang',
						'Bu4h bu4h apa y4ng t1d@k bol3h di m4kan??. Buahaya p4ck!!! Xixixii',
						'KpaDa PaK ZulKifli ToloNg iTikad bAik nya, kmAren Sya liAt bApak nGinTipin ibUk iBuk LaGi senAm -Merasa kesal😠',
						'BaPack-BaPack ronda semalam saya di gigit NyaMuk, kalau nanti nyamuknya bertelur, hingga jadi nyamuk lagi, apakah nyamuk tersebut darah daging saya?.',
						'pAk maMat kaLo nGajaK miSua saYa maiN gAplE hukUmaNnya jaNgan beRat² doNg, maSa puLang² miSua saYa uDah baBak beLur geGara maiNnYa kaLah muLu',
						'Alhamdulillah pak,setelah saya pergi merantau desa saya jadi jarang kemalingan.xixixiii -Merasa bangga',
						'Pak, kenapa nasi goreng, mi goreng, sama bihun goreng nggak dijual di tukang gorengan yah? Padahal kan sama-sama digoreng juga🤔🤔🤔',
						'Nanti KaLaU aNak SaYa niKah Ga aKan di GeDunG TapI di SeKoLah, BiaR BeRkeLas xixixi SalKoMsEl ShoBat DuMay',
						'buah buah apa kalo dipukul marah? buahpakmu xixixixidi -mErasa Durhaka',
						'Untuk bapac bapac yang melihat sarung saya mrek gajah tidur warna hijau, tolong di kembalikan -Merasa Kehilangan',
						'Bu4t p4cK RizKy k4L4u bu4t poliSi Tidur itu TolonG doNg di K4Sih J4r4kny4 TruS j4nG4n segEde g4b4n juG4 y4h p4Ck,S4y4 tunGgu kRaliFik4si d4ri b4p4Ck nt4r m4l4m di poS ronD4 y4h p4cK ~mEraZa KezzEL 4bieeZZ😡',
						'PACK taDi saya masak DI d4PUR,tiba TiB4 saya ketawa, Eh Ternyata d1 Dapur ada temuLAWAK XIXI',
						'paAck aPa bEnar hanD sAnitIzer kAlo jAgO maIn boLa jAdiNya hAndSamu YamA prAnaTa',
						'PakK Klo Lgy NgeRonDa Ad mAliNkK kEtan6kEp JgN diPukuLin, SurUh NyanYi Lagu K3K3 BuKan BonEkA aZa, Tpy PakE BahAzA ZiMbAbW3,,,, xixixi,,,',
						'Ada tetangga baru s4ya ngakunya kerja jadi Pemborong. Tapi s4ya curiga kok tiap kali dia beli di warung Boenda Imah g4k pernah borong. Cuma beli rokok sebatang. Besoknya teh 2 tang. Besoknya lagi Chiki rasa kentang. Apa mungkin dia sebenarnya cuma Pembohong ya pack???',
						'Pack mw tanyA nich, apa bener kalau qta pin9san di depan para PNS, apakah qta akan diangkat PNS? ~ merasa bertanya-tanya',
						'Teruntuk bapac Ahmad tolong dong pack rokok surya saya jangan di bawa pulangg, saya ga ad rokok lgi nich -merasaKezall',
						'Bapack 2 sya ingin bertanya,apa benar jika Boenda2 masak nya keasinan ,garam nya Yang minta maaf .. -Merasa heran + bingung🙄😐',
						'Semalem saya ditampar istri, Tiba" dia marah padahal saya cuma iseng nyelipin kembang dikupingnya. "Kembang api air mancur" 🤭',
						'Pak tau gak menggelengkan kepala ke kanan dan ke kiri bisa menurunkan berat badan? Lakukan 3x sehari ketika ditawari makan 😁👍',
						'mau nimba ilmu tapi dirumah saia pakex sanyo',
						'Hidup ituh singkat Yg pnjng ituh Hiiiiiiiddddddduuuuuuupppp',
						'PaGi tAdi beLi sOtO.. bentuknya aneh, banyak editan.. TeRnyAta, SotOshop.. Xixixi...',
						'CoRoNa CePaTLAh BERAKhiR ',
						'MaSkeR iTu MeNgHaLaNgi SeNyUm ManiEz BoEnDa YuLiaNti Xixixixi 😁😁 -Merasa Dagdigdug🤭🤭🤭',
						'InI bapac bapac RT 09 Bercandanya KeBaNgeTan. Qunci Motor Saya Sudah ketemu malach motornya yg di umpetin. -Ish Merasach Geramz',
						'Anu moon maap pack, Teh angeT saya kok ilang ya?,  -merasa curiga🤔',
						'Met pgi shbt fb,, smg sehat sll,, trims all 😀👍 happy whykend 😀🤲',
						'Bwat pak Romi Rt06,yg kmarin baru ngungsi ke rumah sya, ini istrinya masih ketinggalan. -Merasa Lemas-',
						'Pack kok tiap ngeronda korek S4ya Hilang? -Merasa j3ngkel',
						'KeNapA DiNaMakAn NaSi GoReNg Pack??? KaRenA DiNa LaPar xixixi NgAkAk AbiEzzz',
						'Sol sepatu kalo ditinggiin jadi La sepatu',
						'Pak Ikan Ikan aPA yNg bIs4 nYanYi? IKANg fauziii, xixixi',
						'bapack2x klo minum susu pada pake es gk, klo saya sih pke soalnya klo minum susu gapake es nnt jadinya minum uu,,, xixixix',
						'Pck taoe gack alat untuk menyaring udara yang akan diisap ke ruang bakar melalui air intake yang made in jerman? Adolf Filter xixixixi -ngakAk ab1eZ',
						'Saya merasa kasihan sama tetangga saya, dia menanam PARE dan parenya PAHIT semua.',
						'BapaK BapaK ada Usul bagaimana caranya biar PARENYA Jadi Manis dan Laku di jual ?'
			             ]
					let hasil1 = kata1[Math.floor(Math.random( ) * kata1.length)]
					console.log(hasil1)
					const katabapak = hasil1
					reply(`nih katanya\n\n${katabapak}`
					break
				case 'dare':
				    let katadare = [
					    'Ajak orang yang tidak kamu kenal untuk selfie berdua dengan mu lalu upload ke snapgram',
						'Ambil beberapa nomor dari kontakmu secara acak dan kirim sms "Aku hamil" sama mereka.',
						'Ambil minuman apa saja yang ada didekat mu lalu campurkan dengan cabai dan minum!',
						'Ambil nomor secara acak dari kontakmu, telepon dia, dan bilang "Aku mencintaimu"',
						'Beli makanan paling murah di kantin (atau beli sebotol aqua) dan bilang sambil tersedu-sedu pada teman sekelasmu "Ini.adalah makanan yang paling mahal yang pernah kubeli"',
						'Beli satu botol coca cola dan siram bunga dengan coca cola itu di depan orang banyak.',
						'Berdiri deket kulkas, tutup mata, pilih makanan secara acak didalemnya, pas makanpun mata harus tetep ditutup.',
						'Berdiri di tengah lapangan basket dan berteriak, "AKU MENCINTAIMU PANGERANKU/PUTRIKU"',
						'Beri hormat pada seseorang di kelas, lalu bilang "Hamba siap melayani Anda, Yang Mulia."',
						'Berjalan sambil bertepuk tangan dan menyanyi lagu "Selamat Ulang Tahun" dari kelas ke koridor.',
						'Berlutut satu kaki dan bilang "Marry me?" sama orang pertama yang masuk ke ruangan.',
						'Bikin hiasan kepala absurd dari tisu, apapun itu, terus suruh pose didepan kamera, terus upload',
						'Bilang "KAMU CANTIK/GANTENG BANGET NGGAK BOHONG" sama cewek yang menurutmu paling cantik di kelas ini',
						'Bilang pada seseorang di kelas, "Aku baru saja diberi tahu aku adalah kembaranmu dulu, kita dipisahkan, lalu aku menjalani operasi plastik. Dan ini adalah hal paling serius yang pernah aku katakan."',
						'Buang buku catatan seseorang ke tempat sampah, di depan matanya, sambil bilang "Buku ini isinya tidak ada yang bisa memahami"',
						'Cabut bulu kaki mu sendiri sebanyak 3 kali!',
						'Chat kedua orangtuamu, katakan bahwa kamu kangen dengan mereka lengkap dengan emoticon sedih.',
						'Coba searcing google mengenai hal-hal yang mengerikan atau menggelikan seperti trypophobia, dll.',
						'Duduk relaks di tengah lapangan basket sambil berpura-pura itu adalah pantai untuk berjemur.',
						'isi mulut penuh dengan air dan harus tahan hingga dua putaranJika tertawa dan tumpah atau terminum, maka harus ngisi ulang dan ditambah satu putaran lagi.',
					    'Salamanlah dengan orang pertama yang masuk ke ruangan ini dan bilang "Selamat datang di Who Wants To Be a Millionaire!"',
						'Kirim sms pada orangtuamu "Hai, bro! Aku baru beli majalah Playboy edisi terbaru!"',
						'Kirim sms pada orangtuamu, "Ma, Pa, aku sudah tahu bahwa aku adalah anak adopsi dari Panti Asuhan. Jangan menyembunyikan hal ini lagi."',
						'Kirim sms pada tiga nomor acak di kontakmu dan tulis "Aku baru saja menjadi model majalah Playboy."',
						'Makan satu sendok makan kecap manis dan kecap asin!',
						'Makan sesuatu tapi gak pake tangan.',
						'Marah-marahi ketemen kamu yang gak dateng padahal udah janjian mau main "truth or dare" bareng"',
						'Pecahkan telur menggunakan kepala!',
						'Makanlah makanan yang sudah dicampur-campur dan rasanya pasti aneh, namun pastikan bahwa makanan itu tidak berbahaya untuk kesehatan jangka panjang maupun jangka pendek.',
						'Menari ala Girls Generation untuk cowok di depan kelas, atau menari ala Super Junior untuk cewek.',
						'Mengerek tiang bendera tanpa ada benderanya.',
						'Menggombali orang yang ditaksir, sahabat terdekat, lawan jenis yang tidak dikenal sama sekali dan  sejenisnya.',
						'Meniru style rambut semua temen kamu.',
						'Menyanyikan lagu HAI TAYO di depan banyak orang sambil menari',
						'Menyanyikan lagu Baby Shark dengan keras di ruang kelas.',
						'Minjem sesuatu ke tetangga',
						'Minta tandatangan pada seorang guru yang paling paling galak sambil bilang "Anda benar-benar orang yang paling saya kagumi di dunia."',
						'Minta uang pada seseorang (random/acak) di jalan sambil bilang "Saya tidak punya uang untuk naik angkot."',
						'Minum sesuatu yang udah dibuat/disepakatin, tapi pastiin gak berbahaya, bisa kayak minum sirup yang digaremin terus ditambah kecap.',
						'Ngomong ke gebetannya emoticon-Takut, ngobrol ngalurngidul apapun lah boleh ,via manapun juga bisa.',
						'Nyanyi-nyanyi lagu favorit difilm disney diluar rumah sambil teriak-teriak.',
						'Nyebutin 1 biru sampai 20 biru dengan cepat dan tidak boleh melakukan kesalahan. Jika salah maka harus diulang dari awal.',
						'Pakai mahkota tiruan dari kertas buku dan bilang sama setiap orang di ruangan "BERI PENGHORMATAN PADA YANG MULIA RAJA" sambil menunjuk setiap orang dengan penggaris.',
						'Pake celana kebalik sampe besok paginya.',
						'Peluk orang yang NGGAK kamu sukai di kelas dan bilang, "Terimakasih banyak kamu sudah bersedia menjadi orang paling baik untukku."',
						'Pergi ke lapangan yang luas, lalu berlari sekencang kencangnya sambil mengatakan “aku gila aku gila”',
						'Petik  bunga lalu tancapkan bunga itu ke orang yang tidak kamu kenal (harus lawan jenis ya)',
						'Pilih orang secara acak di jalan, lalu bilang "You dont know youre beautiful" (ala One Direction)',
						'Pura pura kerasukan ex: kerasukan macan dll',
						'Suruh bersiul pas mulutnya lagi penuh dijejelin makanan.',
						'Suruh jadi pelayan buat ngelayanin kamu sama temen-temen kamu buat makan siang.',
						'Suruh pake kaos kaki buat dijadiin sarung tangan.',
						'Suruh pake topi paling aneh/helm paling absurd selama  putaraann kedepan.',
						'Telpon mama kamu dan bilang “ma, aku mau nikah secepatnya”',
						'Telpon mantan kamu dan bialng “aku rindu kamu”',
						'Tuker baju sama orang terdekat sampe ronde berikutnya.',
						'Update status di BBM, Line, WA, atau apapun itu dengan kata kata yang semuanya berawalan "S"',
						'Upload video nyanyi ke youtube yang lagi nyanyiin lagu-lagu populer',
						'Warnain kuku kaki dan tangan tapi dengan warna berbeda-beda buat seminggu.',
						'makan 2 sendok nasi tanpa lauk apapun, kalo seret boleh minum,',
						'spill orang yang bikin kamu jedag jedug,',
						'telfon crush/pacar sekarang dan ss ke pemain,',
						'drop emot "🦄💨" setiap ngetik di gc/pc selama 1 hari.,',
						'ucapin kata "Selamat datang di Who Wants To Be a Millionaire!" ke semua grup yang kamu punya,',
						'marah² ga jelas ke penonton sw kamu urutan 30,',
						'telfon mantan bilang kangen,',
						'yanyiin reff lagu yang terakhir kamu setel,',
						'vn mantan/crush/pacar kamu, bilang hi (namanya), mau telfon dong, bentar ajaa. aku kangen🥺👉🏼👈🏼",',
						'kletekan di meja (yg ada dirumah) sampe lo dimarahin karena berisik,',
						'belanjain (grab/gofood) buat salah satu pemain disini, terserah siapa. budget dibawah 25k,',
						'Bilang ke random people  "Aku baru saja diberi tahu aku adalah kembaranmu dulu, kita dipisahkan, lalu aku menjalani operasi plastik. Dan ini >',
						'sebutin nama nama mantan,',
						'buatin 1 pantun untuk pemain pertama!',
						'ss chat wa,',
						'chat random people dengan bahasa alay lalu ss kesini,',
						'ceritain hal memalukan versi diri sendiri,',
						'tag orang yang dibenci,',
						'Pura pura kerasukan, contoh : kerasukan maung, kerasukan belalang, kerasukan kulkas, dll.,',
						'ganti nama jadi " BOWO " selama 24 jam,',
						'teriak " anjimm gabutt anjimmm " di depan rumah mu,',
						'snap/post foto pacar/crush',
						'sebutkan tipe pacar mu!',
						'bilang "i hv crush on you, mau jadi pacarku gak?" ke lawan jenis yang terakhir bgt kamu chat (serah di wa/tele), tunggu dia bales, kalo udah >',
						'record voice baca surah al-kautsar,',
						'prank chat mantan dan bilang " i love u, pgn balikan. " Tanpa ada kata dare!,',
						'chat ke kontak wa urutan sesuai %batre kamu, terus bilang ke dia "i lucky to hv you!",',
						'ganti nama menjadi "gue anak lucinta luna" selama 5 jam,',
						'ketik pake bahasa sunda 24 jam,',
						'pake foto sule sampe 3 hari,',
						'drop kutipan lagu/quote, terus tag member yang cocok buat kutipan itu,',
					    'kirim voice note bilang can i call u baby?,',
						'ss recent call whatsapp,',
						'Bilang "KAMU CANTIK BANGET NGGAK BOHONG" ke cowo!,',
						'pap ke salah satu anggota grup'
			             ]
					let hasildare = katadare[Math.floor(Math.random( ) * katadare.length)]
					console.log(hasildare)
					const daree = hasildare
					reply(`nih...\n\n${daree}`
					break
				case 'truth':
				    let katatruth = [
					   ' Acara tv apa yang paling kamu benci? Berikan alasannya!',
						'Apa baju yang (menurutmu) paling jelek yang pernah kamu pakai, dan kapan kamu memakainya?',
						'Apa hal paling buruk (gosip) yang pernah kamu bilang tentang temenmu?',
						'Apa hal paling memalukan dari dirimu?',
						'Apa hal paling memalukan dari temanmu?',
						'Apa hal pertama yang kamu lihat saat kamu melihat orang lain (lawan jenis)?',
						'Apa hal pertama yang terlintas di pikiranmu saat kamu melihat cermin?',
						'Apa hal terbodoh yang pernah kamu lakukan?',
						'Apa hal terbodoh yang pernah kamu lakukan?',
						'Apa ketakutan terbesar kamu?',
						'Apa mimpi terburuk yang pernah kamu alami?',
						'Apa mimpi terkonyol yang sampai sekarang kamu kamu ingat?',
						'Apa pekerjaan paling konyol yang pernah kamu bayangin kamu akan jadi?',
						'Apa sifat terburukmu menurut kamu?',
						'Apa sifat yang ingin kamu rubah dari dirimu?',
						'Apa sifat yang ingin kamu rubah dari temanmu?',
						'Apa yang akan kamu lakuin bila pacarmu bilang hidung atau jarimu jelek?',
						'Apa yang kamu fikirkan sebelum kamu tidur ? ex: menghayal tentang jodoh,dll.',
						'Apakah hal yang menurutmu paling menonjol dari dirimu?',
						'Bagian tubuh temanmu mana yang paling kamu sukai dan ingin kamu punya?',
						'Bagian tubuhmu mana yang paling kamu benci?',',
						'Dari semua kelas yang ada di sekolah, kelas mana yang paling ingin kamu masuki dan kelas mana yang paling ingin kamu hindari?',
						'Deksripsikan teman terdekat mu!',
						'Deskripsikan dirimu dalam satu kata!',
						'Film dan lagu apa yang pernah membuat kamu menangis?',
						'Hal apa yang kamu rahasiakan sampe sekarang dan gak ada satu orangpun yang tau?',
						'Hal paling romantis apa yang seseorang (lawan jenis) pernah lakuin atau kasih ke kamu?',
						'Hal-hal menjijikan apa yang pernah kamu alami ?',
						'Jika kamu lahir kembali dan harus jadi salah satu dari temanmu, siapa yang akan kamu pilih untuk jadi dia?',
						'Jika punya kekuatan super/ super power ingin melakukan apa',
						'Jika sebentar lagi kiamat, apa yang kamu lakukan ?',
						'Kalo kamu disuruh operasi plastik dengan contoh wajah dari teman sekelasmu, wajah siapa yang akan kamu tiru?',
						'Kamu pernah mencuri sesuatu gak?',
						'Apakah kamu takut mati? kenapa?',
						'Kapan terakhir kali kamu menangis dan mengapa?',
						'Apa kemampuan spesial kamu apa?',
						'Kok bisa suka sama orang yang kamu sukai?',
						'Menurutmu, apa sifat baik teman terdekatmu yang nggak dia sadari?',
						'Orang seperti apa yang ingin kamu nikahi suatu saat nanti?',
						'Pekerjaan paling ngenes apa yang menurutmu cocok untuk teman yang sedang duduk di sebelahmu? Dan kenapa?',
						'Pengen tukeran hidup sehari dengan siapa? (teman terdekat yang kalian sama-sama tahu) dan mengapa',
						'Pernahkah kamu diam-diam berharap hubungan seseorang dengan pacarnya putus? Siapa?',
						'Pilih PACAR atau TEMAN ? why?',
						'Quote apa yang paling kamu ingat dan kamu suka?',
						'Rahasia apa yang belum pernah kamu katakan sampai sekarang kepada teman mu ?',
						'Siapa panutan yang benar-benar menjadi panutanmu?',
						'Siapa di antara temanmu yang kamu pikir matre?',
						'Siapa di antara teman-temanmu yang menurutmu potongan rambutnya paling nggak banget?',
						'Siapa diantara temen-temenmu yang paling NGGAK fotogenik dan kalo difoto lagi ketawa mukanya jelek banget?',
						'Siapa mantan terindah mu? dan mengapa kalian putus ?!',
						'Siapa nama artis yang pernah kamu bucinin diam-diam?',
						'Siapa nama guru cowok yang pernah kamu sukai dulu?',
						'Siapa nama mantan pacar teman mu yang pernah kamu sukai diam diam?',
						'Siapa nama orang (lawan jenis) yang menurutmu akan asyik bila dijadikan pacar?',
						'Siapa nama orang yang kamu benci, tapi kamu rasa orang itu suka sama kamu (nggak harus lawan jenis)?',
						'Siapa nama orang yang pernah kamu kepoin diam-diam?',
						'Siapa orang (lawan jenis) yang paling sering terlintas di pikiranmu?',
						'Siapa orang yang paling menjengkelkan di antara teman teman mu ? alasannya!',
						'Siapa sebenernya di antara teman-temanmu yang kamu pikir harus di make-over?',
						'Siapa yang paling mendekati tipe pasangan idealmu di sini',
						'Ayah atau ibu ',
						'Bagian tubuh yang kamu tidak suka',
						'Suka ilfil tentang apa',
						'Pernah selingkuh?',
						'Pernah ciuman ?',
						'Pacaran paling sebentar berapa hari/bulan/tahun ?',
						'Apa hal pertama yang akan Anda lakukan jika Anda bangun sebagai lawan jenis?',
						'Pernahkah Anda membiarkan orang lain mendapat masalah karena sesuatu yang Anda lakukan?',
						'Apa hal paling memalukan yang pernah Anda lakukan?',
						'Apa alasan paling konyol bahwa Anda pernah putus dengan seseorang?',
						'Apa kebiasaan paling buruk yang Anda miliki?',
						'Menurut Anda apa fitur terbaik Anda? Dan apa yang terburuk?',
						'Apa hal paling berani yang pernah kamu lakukan?',
						'Siapa di ronde yang ingin kamu enchant pada babi?',
						'Kapan terakhir kali Anda mengompol?',
						'Apa yang paling kamu impikan dari tidur?',
						'Jika Anda akan menghasilkan uang secara ilegal, bagaimana Anda membuatnya?',
						'Apa yang kekanak-kanakan yang masih Anda lakukan?',
						'Jika Anda buta, siapa yang akan menjadi anjing pemandu Anda?',
						'Apa yang paling mengesankan Anda?',
						'Jika Anda diizinkan untuk menggunakan hanya 3 kata untuk sisa malam mulai sekarang - yang mana itu?',
						'Jika Anda seorang diktator, hukum mana yang akan Anda undang terlebih dahulu?',
						'Jika Anda hidup selama era Nazi, siapa Anda?',
						'Apa pengalaman paling memalukan di waktu sekolah / waktu belajar / pendidikan / tahun lalu?',
						'Apa kesalahan terbesar dalam hidup Anda?',
						'Apa yang tidak akan pernah Anda lakukan - bahkan jika Anda tahu Anda hanya memiliki 12 jam lagi untuk hidup?',
						'Pelanggaran apa yang telah Anda lakukan?',
						'Ceritakan padaku rahasia dari masa kecilmu.',
						'Apa wakil (rahasia) terbesar Anda?',
						'Apa yang ingin Anda lakukan dengan saya … (atau orang xy), jika Anda kemudian dapat menghapus ingatannya (dia, …)?',
						'Apa hal terburuk yang pernah Anda lakukan kepada siapa pun?',
						'Siapa yang paling kamu sukai?',
						'Pernahkah Anda jatuh cinta dengan salah satu yang hadir?',
						'Jika Anda seorang vampir, siapa di antara kita yang akan Anda gigit sekarang?',
						'Apa hal terburuk yang pernah Anda alami?',
						'Apakah Anda pernah buang air besar di depan umum?',
						'Apa hal terbaik yang pernah Anda alami dengan orang lain?',
						'Apa turn-off terbesar bagi Anda?',
						'Apa yang paling Anda sukai dari tubuh Anda dan apa yang paling jelek?',
						'Siapa di babak ini yang bisa membuatmu jatuh cinta?',
						'Pernahkah Anda memiliki mimpi erotis di mana seseorang dari babak ini terjadi?',
						'Jika Anda akan menato diri Anda di area genital - apa yang akan ada di sana?',
						'Bagian tubuh manakah yang paling membuat Anda?',
						'Bagaimana, di mana dan dengan siapa Anda pertama kali?',
						'Seberapa pentingkah foreplay yang diperluas untuk Anda?',
						'Apa yang harus dilakukan pria / wanita untuk menggoda Anda?',
						'Hewan apa yang paling cocok untukmu dan mengapa?',
						'Apa kencan terburukmu?',
						'Siapa yang ingin kamu cium sekarang?',
						'Apakah kamu selalu setia?',
						'Apakah Anda memiliki naksir remaja?',
						'Di orang mana kamu jatuh cinta?',
						'Selebritas mana yang ingin kamu kencani?',
						'Apa waasa saat paling memalukan dalam hidup Anda?',
						'Mulut mana yang paling Anda sukai dari grup di sini?',
						'Pemain mana yang memiliki tangan paling indah?',
						'Di mana ciuman pertamamu?',
						'Siapa di ronde yang paling ingin Anda cium?',
						'Siapa di meja mungkin yang paling geli?',
						'Apa kesalahan terbesar dalam hidup Anda?',
						'Apakah sesuatu yang memalukan terjadi pada Anda berkencan?',
						'Apakah Anda pernah melakukan kontak dengan narkoba?',
						'Orang mana yang ingin kamu cium sekarang?',
						'Kapan terakhir kali Anda mabuk?',
						'Pernahkah kamu selingkuh saat ujian sekolah?',
						'Pernahkah kamu mencuri sesuatu di masa lalu?',
						'Apakah kamu mendengkur di malam hari?',
						'Yang manakah lagu favoritmu?',
						'Dengan pemain mana Anda akan bertukar selama 1 minggu dan mengapa?',
						'Anda pindah ke pulau yang sepi, siapa yang Anda bawa dari sini?',
						'Apa yang paling kamu takuti?',
						'Di mana Anda bercukur di mana-mana?',
						'Apakah Anda memiliki nama panggilan?',
						'Apakah Anda melihat ke dalam toilet sebelum mencuci?',
						'Siapa yang memberimu sakit hati terburuk?',
						'Berapa kali kamu mencium?',
						'Apa hal paling memalukan yang pernah terjadi padamu?',
						'Berapa banyak tipe / cewek yang sudah kamu cium?',
						'Kamu jatuh cinta dengan siapa?',
						'Bintang mana yang kamu sukai?',
						'Apakah Anda memulai sesuatu dengan XY (masukkan nama)?',
						'Pernahkah kamu mencuri sesuatu?'
			             ]
					let hasiltruth = katadare[Math.floor(Math.random( ) * katatruth.length)]
					console.log(hasiltruth)
					const truthh = hasiltruth
					reply(`nih...\n\n${truthh}`
					break
				case 'rulest&d':
			       reply('Sebelum bermain berjanjilah akan melaksanakan apapun perintah yang diberikan.\n\nSilahkan Pilih:\n➥ !truth\n➥ !dare')
		           break
				case 'images':
				    if (args.length < 1) return reply('pertanyaannya mana Ngab?')
				    jar = await fetchJson(`https://api.fdci.se/rep.php?gambar=${body.slice(6)}`, {method : 'get'}) 
					
					let hasil7 = jar[Math.floor(Math.random( ) * jar.length)]
					buffer = await getBuffer(hasil7.result)
					console.log(hasil1)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'stickergambar':
					let kataline = [
					    'https://store.line.me/stickershop/product/1395596/id',
					    'https://store.line.me/stickershop/product/1668096/id',
						'https://store.line.me/stickershop/product/1457442/id',
						'https://store.line.me/stickershop/product/12913418/id'
					
					let hasilline = kataline[Math.floor(Math.random( ) * kataline.length)]
					console.log(hasilline)
					const lines = hasilline
				    jar = await fetchJson(`https://api.zeks.xyz/api/linesticker?link=${lines}&apikey=${zeks}`, {method : 'get'}) 
					
					let hasilline2 = jar[Math.floor(Math.random( ) * jar.length)]
					buffer = await getBuffer(hasilline2.result)
					console.log(hasilline2)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
                case 'dare':
				    jar = await fetchJson(`https://raw.githubusercontent.com/AlvioAdjiJanuar/random/main/dare.txt`, {method : 'get'}) 
					let hasildare = jar[Math.floor(Math.random( ) * jar.length)]
					reply(`Nih\n\n"${hasildare.result}"`)
					break
				case 'truth':
				    jar = await fetchJson(`https://raw.githubusercontent.com/AlvioAdjiJanuar/random/main/dare.txt`, {method : 'get'}) 
					let hasiltruth = jar[Math.floor(Math.random( ) * jar.length)]
					reply(`Nih\n\n"${hasiltruth.result}"`)
					break
				case 'pantun':
				    anu = await fetchJson(`https://api.i-tech.id/tools/pantun?key=zzfmy1-dEzUYu-bTzKfs-mWOVri-blrNBe`)
					reply(`nih\n\n${anu.result}`)
					break
				case 'Fakta':
				    anu = await fetchJson(`https://api.i-tech.id/tools/fakta?key=zzfmy1-dEzUYu-bTzKfs-mWOVri-blrNBe`)
					reply(`*Fakta Menarik*\n\n"${anu.result}"`)
					break
				case 'toxic':
				    anu = await fetchJson(`https://inoiz.herokuapp.com/api/toxic`)
					reply(`${anu.result}`)
					break
				case 'howbucin':
				    anu = await fetchJson(`https://arugaz.herokuapp.com/api/howbucins`)
					reply(`Dia Bucin ${anu.persen}%\n-${anu.desc}`)
					break
				case 'kapankah':
				    if (args.length < 1) return reply('pertanyaannya mana Ngab?')
				    let kata2 = [
					    '1 Hari lagi',
					    '1 Minggu lagi',
						'1 Bulan lagi',
			'1 Tahun lagi']
					const when = args.join(' ')
					let hasil2 = kata1[Math.floor(Math.random( ) * kata2.length)]
					console.log(hasil2)
					const kapankah = hasil2
					reply(`Pertanyaan: *${when}* \n\nJawaban: ${kapankah}`)
					break	
                case '':
				    if (args.length < 1) return reply('pertanyaannya mana Ngab?')
				    let kataline = [
					    'https://store.line.me/stickershop/product/1395596/id',
					    'https://store.line.me/stickershop/product/1668096/id',
						'https://store.line.me/stickershop/product/1457442/id',
						'https://store.line.me/stickershop/product/12913418/id'
					]
					let hasilline = kataline[Math.floor(Math.random( ) * kataline.length)]
					console.log(hasilline)
					const lines = hasilline
					
					break		
				//other
				https://sman1ak.sch.id/wp-content/uploads/2020/04/woke.jpg
				case 'corona':
				    if (args.length < 1) return reply('Negara Mana Ngab?')
					jarcor = await getBuffer('https://sman1ak.sch.id/wp-content/uploads/2020/04/woke.jpg')
				    jar = await fetchJson(`https://arugaz.my.id/api/edu/corona?country=${body.slice(8)}`, {method : 'get'}) 
					teks = `Kasus Covid-19 *${jar.country}*\n\n*Jumlah Kasus:* ${jar.cases}\n*Aktif:* ${jar.active}\n*Sembuh:* ${jar.recovered}\n*Kematian:* ${jar.deaths}\n\nInfo Lebih Lanjut\nhttps://covid19.go.id/peta-sebaran\n\n*A F S* _BOT_`
					client.sendMessage(from, jarcor, image, {quoted: mek, caption: teks})
					break
					
					
					
					
					
					
				//new
				case 'dewabatch':
				    if (args.length < 1) return reply('animenya apa Ngab?')
				    jar = await fetchJson(`https://arugaz.herokuapp.com/api/dewabatch?q=${body.slice(11)}`, {method : 'get'}) 
					teks = `${jar.result}\n${jar.sinopsis}\n\n*A F S* _BOT_`
					thumb = await getBuffer(jar.thumb)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					break
				case 'cekzodiak':
				    if (args.length < 1) return reply('teksnya mana Ngab?')
					argz = body.trim().split(' ')
					const namamu = argz[1]
					const tanggalee = argz[2]
				    jar = await fetchJson(`https://arugaz.herokuapp.com/api/getzodiak?nama=${namamu}&tgl-bln-thn=${tanggalee}`, {method : 'get'}) 
					reply(`*Cek Zodiak*\n\n*Nama :* ${nama}\n*Lahir :* ${lahir}\n*Ulang Tahun :* ${ultah}\n*Usia :* ${usia}\n*Zodiak :* ${zodiak}\n\n*AFS* _BOT_`)
					break
				case 'cekjodoh':
				    if (args.length < 1) return reply('animenya apa Ngab?')
					argz = body.trim().split(' ')
					const namamu1 = argz[1]
					const pasangan = argz[2]
				    jar = await fetchJson(`https://arugaz.herokuapp.com/api/jodohku?nama=${namamu1}&pasangan=${pasangan}`, {method : 'get'}) 
					teks = `*Cek Jodoh*\n\n*Nama :* ${jar.nama}\n*Pasangan :* ${jar.pasangan}\n*Positif :* ${jar.positif}\n*Negatif :* ${jar.negatif}\n\n*A F S* _BOT_`
					thumb = await getBuffer(jar.gambar)
					client.sendMessage(from, gambar, image, {quoted: mek, caption: teks})
					break
				case 'happymod':
				    if (args.length < 1) return reply('Mau Cari aplikasi apa Ngab?')
				    jar = await fetchJson(`https://api.zeks.xyz/api/happymod?apikey=${zeks}&q=${body.slice(10)}`, {method : 'get'}) 
					let jarapk = jar.result[Math.floor(Math.random( ) * jar.result.length)]
					teks = `*Happy Mod*\n\n*title :* ${jarapk.title}\n*Rating :* ${jarapk.rating}\n*Url :* ${jarapk.url}\n\n*A F S* _BOT_`
					thumb = await getBuffer(jarapk.thumb)
					client.sendMessage(from, gambar, image, {quoted: mek, caption: teks})
					break
				case 'translate':
					if (args.length < 1) return reply('Format Salah Ngab\nContoh : !translate |id|en|namaku ardan')
					argz = body.trim().split('|')
					const bahasa1 = argz[1]
					const bahasa2 = argz[2]
					const terjemahkan = argz[3]
					anu = await fetchJson(`https://docs-jojo.herokuapp.com/api/translate?text=${terjemahkan}&from=${bahasa1}&to=${bahasa2}`, {method: 'get'})
					reply(`*AFS Translate*\n\nDari : *${anu.from}*\nKe : *${anu.to}*\nTeks : *${anu.original_text}*\nHasil : *${anu.translated_text}*\n\n*AFS* _BOT_`)
					break
				case 'Hoax':
					jar = await fetchJson(`https://docs-jojo.herokuapp.com/api/infohoax`, {method: 'get'})
					let anuq = jar.result[Math.floor(Math.random( ) * jar.result.length)]
					teks = `*AFS Info Hoax*\n\nTag : *${anuq.tag}*\nJudul : *${anuq.title}*\nLink : *${anuq.link}*\n\n*AFS* _BOT_`
					gambar = await getBuffer(jarapk.image)
					client.sendMessage(from, gambar, image, {quoted: mek, caption: teks})
					break
				case 'barqode':
					anu = await getBuffer(`https://api.zeks.xyz/api/barcode?apikey=${zeks}&text=${body.slice(9)}`, {method: 'get'})
					client.sendMessage(from, anu, image, {quoted: mek, caption: `Barqode|*${body.slice(9)}*`})
					break	
				case 'news':
					anu = await fetchJson(`https://docs-jojo.herokuapp.com/api/translate?text=${terjemahkan}&from=${bahasa1}&to=${bahasa2}`, {method: 'get'})
					let news1 = anu.result[Math.floor(Math.random( ) * jar.result.length)]
					reply(`*AFS News*\nTribunews\n\n*Judul :* ${news1.title}\n*Keterangan :* ${news1.ket}\n*Dipublikasikan :* ${news1.time}\n*Hasil :*${news1.url}*\n\n*AFS* _BOT_`)
					break	
				case 'getsticker':
				    if (args.length < 1) return reply('Mau Cari Apa?')
					anu = await fetchJson(`https://docs-jojo.herokuapp.com/api/getsticker?q=${body.slice(12)}`, {method: 'get'})
					let gets = anu.result.sticker[Math.floor(Math.random( ) * anu.result.sticker.length)]
					gambar = await getBuffer(gets)
					client.sendMessage(from, gambar, sticker, {quoted: mek})
					break
				case 'wallpaperhd':
				    if (args.length < 1) return reply('Mau Cari Apa?')
					anu = await fetchJson(`https://docs-jojo.herokuapp.com/api/wallpaper_hd?q=${body.slice(13)}`, {method: 'get'})
					let gets = anu.result.sticker[Math.floor(Math.random( ) * anu.result.sticker.length)]
					teks = `Nih...\nWallpaperhd| *${body.slice(13)}`
					gambar = await getBuffer(gets)
					client.sendMessage(from, gambar, image, {quoted: mek, caption: teks})
					break	
					
					
				case 'jam':
					anu = await fetchJson(`https://api.zeks.xyz/api/jamdunia?q=${body.slice(6)}&apikey=${zeks}`, {method: 'get'})
					reply(`*Jam*\n\n*tempat :* ${anu.tempat}\n*Waktu :* ${anu.waktu}\n*Tanggal :* ${anu.tanggal}\n\n*AFS* _BOT_`)
					break		
					
				case 'breakwall':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.zeks.xyz/api/breakwall?apikey=${zeks}&text=${body.slice(9)}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'gneon':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.zeks.xyz/api/gneon?apikey=${zeks}&text=${body.slice(7)}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'sandw':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.zeks.xyz/api/sandw?apikey=${zeks}&text=${body.slice(7)}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'dropwater':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.zeks.xyz/api/dropwater?apikey=${zeks}&text=${body.slice(10)}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
					
					
				case 'coffee':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=coffee&text=${body.slice(8)}&apikey=${tobz}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
                case 'wolfmetal':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=wolf_metal&text=${body.slice(11)}&apikey=${tobz}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
                case 'utg':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=message_under_the_grass&text=${body.slice(5)}&apikey=${tobz}`, {method: 'get'})
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break	
                case 'simi':
					anu = await fetchJson(`https://st4rz.herokuapp.com/api/simsimi?kata=${body.slice(6)}`, {method: 'get'})
					reply(anu.msg)
					reply(`Simi Berkata: ${anu.result}`)
					break
                 case 'ampun'
				    anu = await getBuffer(`https://raw.githubusercontent.com/FlinSkyReal/FLIN-SKY-BOT/main/sound/abangjago.mp3`, {method: 'get'})
					client.sendMessage(from, anu, audio, {mimetype: 'audio/mp4', filename: 'ampun.mp3', quoted: mek})
					client.sendMessage(from, help(prefix), text)
					break
				case 'iri'
				    anu = await getBuffer(`https://raw.githubusercontent.com/FlinSkyReal/FLIN-SKY-BOT/main/sound/iri.mp3`, {method: 'get'})
					client.sendMessage(from, anu, audio, {mimetype: 'audio/mp4', filename: 'iri.mp3', quoted: mek})
					break
				case 'tarekses'
				    anu = await getBuffer(`https://raw.githubusercontent.com/FlinSkyReal/FLIN-SKY-BOT/main/sound/tarekses.mp3`, {method: 'get'})
					client.sendMessage(from, anu, audio, {mimetype: 'audio/mp4', filename: 'tarek.mp3', quoted: mek})
					break
				case 'welot'
				    anu = await getBuffer(`https://raw.githubusercontent.com/FlinSkyReal/FLIN-SKY-BOT/main/sound/welot.mp3`, {method: 'get'})
					client.sendMessage(from, anu, audio, {mimetype: 'audio/mp4', filename: 'welot.mp3', quoted: mek})
					break
                case 'bernyanyi'
				    anu = await getBuffer(`https://raw.githubusercontent.com/setyawan12/bernyanyibernyanyi/main/mp3/bernyanyi.mp3`, {method: 'get'})
					client.sendMessage(from, anu, audio, {mimetype: 'audio/mp4', filename: 'bernyanyi.mp3', quoted: mek})
					break
				
                 case 'tebakgambar':
					anu = await fetchJson(`https://api.zeks.xyz/api/tebakgambar?apikey=${zeks}`, {method: 'get'})
					jar = await fetchJson(`https://api.zeks.xyz/api/ssweb?url=https://youtube.com&apikey=apivinz`, {method: 'get'})
					gambar = await getBuffer(anu.result.soal)
					teks = `*Jawaban :* ${anu.result.jawaban}`
					client.sendMessage(from, gambar, image, {quoted: mek, caption: 'Hayo Jawabannya Apa?'})
					console.log(jar.result)
					client.sendMessage(from, teks, text)
					break					
					
					
				https://api.zeks.xyz/api/happymod?apikey=${zeks}&q=${body.slice(10)}
				//other2
				case 'randomkpop':
				    if (args.length < 1) return reply('teksnya mana um?')
					jar = await fetchJson(`https://tobz-api.herokuapp.com/api/randomkpop?apikey=${tobz}`)
					buffer = await getBuffer(jar.result)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'joox':
					if (args.length < 1) return reply('Urlnya mana um?')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/joox?q=${body.slice(5)&apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `*anu.result.judul`
					thumb = await getBuffer(anu.result.thumb)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					buffer = await getBuffer(anu.result.mp3)
					client.sendMessage(from, buffer, audio, {mimetype: 'audio/mp4', filename: `${anu.title}.mp3`, quoted: mek})
					break
				case 'waifu':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await fetchJson(`https://docs-jojo.herokuapp.com/api/waifu2`)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'blackpink':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await getBuffer(`http://api.kocakz.xyz/api/textpro/blackpink?text=${body.slice(10)}.` {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'kalender':
				     mediaaa = await client.downloadAndSaveMediaMessage(mek)
					buffer = await getBuffer(`https://api.zeks.xyz/api/calendar?img=${mediaaa}&apikey=${zeks}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'blackbird':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await getBuffer(`http://api.kocakz.xyz/api/flamingtext/blackbird?text=${body.slice(10)}.` {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				https://arugaz.herokuapp.com/api/nulis?text=${body.slice(8)}
				case 'marvel':
				    if (args.length < 1) return reply('teksnya mana um?')
					argz = body.trim().split('|')
					const edanaaa = argz[1]
					const edanbbb = argz[2]
					buffer = await getBuffer(`http://api.kocakz.xyz/api/textpro/marvelstudio?text1=${edanaaaa}&text2=${edanbbbb}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'burnpaper':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await getBuffer(`https://arugaz.my.id/api/photooxy/text-on-burn-paper?text=${body.slice(11)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'nulis1':
				    if (args.length < 1) return reply('teksnya mana um?')
					argz = body.trim().split('|')
					const edanaaa = argz[1]
					const edanbbb = argz[2]
					buffer = await getBuffer(`https://arugaz.herokuapp.com/api/nulis?text=${body.slice(8)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'glitc':
				    if (args.length < 1) return reply('teksnya mana Ngab?')
					argz = body.trim().split(' ')
					const glitc1 = argz[1]
					const glitc2 = argz[2]
					buffer = await getBuffer(`https://arugaz.my.id/api/textpro/glitchtext?text1=${glitc1}&text2=${glitc2}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'smoke':
				    if (args.length < 1) return reply('teksnya mana Ngab?')
					buffer = await getBuffer(`https://arugaz.my.id/api/photooxy/smoke-effect?text=${body.slice(7)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'sky':
				    if (args.length < 1) return reply('teksnya mana Ngab?')
					buffer = await getBuffer(`https://arugaz.my.id/api/textpro/cloudsky?text=${body.slice(5)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'matrix':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await getBuffer(`https://arugaz.my.id/api/textpro/matrixtext?text=${body.slice(8)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'hartatahta':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await getBuffer(`https://api.zeks.xyz/api/hartatahta?text=${body.slice(12)}&apikey=${zeks}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Harta Tahta Bot'})
					break
				case 'qrcode':
				    if (args.length < 1) return reply('teksnya mana Ngab?')
					buffer = await getBuffer(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${body.slice(6)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'QRCODE'})
					break
				case 'nulis':
				    if (args.length < 1) return reply('teksnya mana um?')
					argz = body.trim().split('|')
					const nulis1 = argz[1]
					const nulis2 = argz[2]
					const nulis3 = argz[3]
					const tinta = argz[4]
					buffer = await getBuffer(`https://api.zeks.xyz/api/magernulis?nama=${nulis1}&kelas=${nulis2}&text=${nulis3)&tinta={tinta}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Mager ya....'})
					break
				case 'nulis1':
				    if (args.length < 1) return reply('teksnya mana Ngab?')
					buffer = await getBuffer(`https://api.zeks.xyz/api/nulis?text=${body.slice(8)}&apikey=${zeks}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Mager ya....'})
					break
				case 'blood':
				    if (args.length < 1) return reply('teksnya mana um?')
					buffer = await getBuffer(`http://api.kocakz.xyz/api/textpro/bloodtext?text=${body.slice(6)}`, {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'avengers':
				    if (args.length < 1) return reply('teksnya mana um?')
					argz = body.trim().split('|')
					const edanaaaa = argz[1]
					const edanbbbb = argz[2]
					buffer = await getBuffer(`http://api.kocakz.xyz/api/textpro/avengers?text1=${edanaaaa}&text2=${edanbbbb}.` {method : 'get'})
					client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Tuh'})
					break
				case 'jadwaltv':
				    if(args.length < 1) return reply('channelnya apa ngab')
					buffer = await getBuffer(`https://docs-jojo.herokuapp.com/api/jadwaltv?ch=${body.slice(9)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'sholat':
					if (args.length < 1) return reply('Kotanya mana um?')
					anu = await fetchJson(`https://api.i-tech.id/tools/sholat?key=${edan}&kota=${body.slice(7)}`, {method: 'get'})
					reply(`Jadwal Sholat l*${anu.kota}*\n${anu.tanggal}\nKeterangan: ${anu.note}\nTerbit:*${anu.terbit}*\nImsak:*${anu.imsak}*\nSubuh:*${anu.subuh}*\nDhuha:*${anu.dhuha}*\nDzuhur:*${anu.dzuhur}*\nAshar:*${anu.ashar}*\nMaghrib:*${anu.maghrib}*\nIsya:*${anu.isya}*\n\n\n*A F S* BOT`)
					break
				case 'alay':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.i-tech.id/tools/alay?key=${edan}&kata=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'artinama':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.i-tech.id/tools/arti?key=${edan}&nama=${body.slice(7)}`, {method: 'get'})
					reply(anu.arti)
					break
				case 'kucing':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/tools/cat?key=${edan}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'texttoimg':
					reply(mess.wait)
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/ttp?text=${body.slice(11)}&apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.base64)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'anjing':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/tools/dog?key=${edan}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				https://api.zeks.xyz/api/pin?q=${body.slice(8)}&apikey=${zeks}
				case 'Memeindo':
					reply(mess.wait)
					jar = await fetchJson(`https://api.zeks.xyz/api/memeindo?apikey=benbenz`, {method: 'get'})
					if (jar.error) return reply(jar.error)
					buff = await getBuffer(jar.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: 'Tuh....'})
					break
				case 'images2':
					jar = await fetchJson(`https://api.zeks.xyz/api/pin?q=${body.slice(8)}&apikey=${zeks}`, {method: 'get'})
					if (jar.error) return reply(jar.error)
					teksima = body.slice(8)
					buff = await getBuffer(jar.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: `Tuh....\nHasil Pencarian : *${teksima}*`})
					break
				case 'darkjokes':
					reply(mess.wait)
					jar = await fetchJson(`https://api.zeks.xyz/api/darkjokes?apikey=${zeks}`, {method: 'get'})
					if (jar.error) return reply(jar.error)
					buff = await getBuffer(jar.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: 'Tuh....'})
					break
				case 'kambing':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/tools/goat?key=${edan}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'lion':
					if(args.length < 1) return reply('teksnya 1 mana ngab')
					if(args.length < 2) return reply('teksnya 2 mana ngab')
					argz = body.trim().split('|')
					const edana = argz[1]
					const edanb = argz[2]
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/textpro?theme=lionlogo&text1=${body.slice(4)}&text2=${body.slice(4)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'pubg':
					if(args.length < 1) return reply('teksnya 1 mana ngab')
					if(args.length < 2) return reply('teksnya 2 mana ngab')
					argz = body.trim().split('|')
					const pubg1 = argz[1]
					const pubg2 = argz[2]
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=pubg&text1=${pubg1}&text2=${pubg2}&apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'harrypotter':
					if(args.length < 1) return reply('teksnya 1 mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=harry_potter&text=${body.slice(13)}&apikey=${zeks}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: `Nih...\n*Isi :* ${body.slice(13)}`})
					break
				case 'fixbug':
				     if (!isOwner) return reply(mess.only.ownerB)
                     const pesan = body.slice(5)
                      if (pesan.length > 300) return client.sendMessage(from, 'Maaf Teks Terlalu Panjang, Maksimal 300 Teks', msgType.text, {quoted: mek})
                        var nomor = mek.participant
                       const teks1 = `*[REPLY REPORT]*\nDari Owner Bot\nPesan : ${pesan}`
                      var options = {
                         text: teks1,
                         contextInfo: {mentionedJid: [nomor]},
                     }
                    client.sendMessage('${balasbug}@s.whatsapp.net', options, text, {quoted: mek})
                    reply('sukses telah di laporkan ke owner BOT, laporan palsu/main2 tidak akan ditanggapi.')
                    break
				case 'send':
					if (args.length < 1) return
					if (!isOwner) return reply(mess.only.ownerB)
					balasbug = args[0]
					reply(`Prefix berhasil di ubah menjadi : ${balasbug}`)
					break
				case 'csgo':
					if(args.length < 1) return reply('teksnya mana ngab?')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=csgo&text=${body.slice(6)}&apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: 'Nih Ngab'})
					break
					https://api.zeks.xyz/api/naruto?text=${body.slice(8)}&apikey=${zeks}
				case 'ff':
					if(args.length < 1) return reply('teksnya mana ngab?')
					anu = await fetchJson(`https://api.zeks.xyz/api/epep?text=${body.slice(4)}&apikey={zeks}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: 'Nih Ngab'})
					break
				case 'naruto':
					if(args.length < 1) return reply('teksnya mana ngab?')
					anu = await fetchJson(`https://api.zeks.xyz/api/naruto?text=${body.slice(8)}&apikey=${zeks}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: 'Nih Ngab'})
					break
				case 'crossfire':
					if(args.length < 1) return reply('teksnya mana ngab?')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/photooxy?theme=crossfire&text=${body.slice(11)}&apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: 'Nih Ngab'})
					break
				case 'emoji':
					if(args.length < 1) return reply('teksnya mana ngab?')
					anu = await getBuffer(`https://api.zeks.xyz/api/emoji-image?apikey=${zeks}&emoji=${body.slice(7)}`, {method: 'get'})
					client.sendMessage(from, anu, image, {quoted: mek, caption: 'Nih Ngab'})
					break
				case 'randomwaifu':
					if(args.length < 1) return reply('teksnya 1 mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/waifu?apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.image)
					tekshusbu = `Nama: ${anu.name}\nDesc : ${anu.desc}`
					client.sendMessage(from, buff, image, {quoted: mek, caption: tekshusbu})
					
					break
				,case 'randomhusbu':
					if(args.length < 1) return reply('teksnya 1 mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/husbu?apikey=${tobz}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.image)
					tekshusbu = `Nama: ${anu.name}`
					client.sendMessage(from, buff, image, {quoted: mek, caption: tekshusbu})
					break
				case 'wolf
					if(args.length < 1) return reply('teksnya 1 mana ngab')
					if(args.length < 2) return reply('teksnya 2 mana ngab')
					argz = body.trim().split('|')
					const edana = argz[1]
					const edanb = argz[2]
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/textpro?theme=wolflogo1&text1=${edana}&text2=${edanb}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'blooda':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/textpro?theme=blood&text=${body.slice(6)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'joker':
					if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/textpro?theme=dropwater&text=${body.slice(10)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				
				case 'qr':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/tools/qr?key=${edan}&query=${body.slice(4)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'cuk':
					reply(mess.wait)
					aruga.sendFileFromUrl(from, `https://docs-jojo.herokuapp.com/api/text3d?text=${body.slice(4)}`, '', 'Nih...', id)
					break
				case 'instagram':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/dl/igdl?key=${edan}&link=${body.slice(4)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					if client.sendMessage(from, buff, image, 'foto.jpg', {quoted: mek, caption: mess.success})
					break
				case 'ss':
					reply(mess.wait)
					anu = await fetchJson(`https://api.i-tech.id/tools/ssweb?key=${edan}&link=${body.slice(4)}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'ninja':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://api.i-tech.id/tools/ninja?key=${apiKey}&kata=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'chord':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://arugaz.herokuapp.com/api/chord?q=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'wiki':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://arugaz.herokuapp.com/api/wiki?q=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'lirik2':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://arugaz.herokuapp.com/api/lirik?judul=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'lirik':
				    if(args.length < 1) return reply('teksnya mana ngab')
					anu = await fetchJson(`https://tobz-api.herokuapp.com/api/lirik?q=${body.slice(6)}&apikey=${tobz}`, {method: 'get'})
					teks = `*Lirik Lagu*\n\n*Judul :* ${anu.result.album}\n*Penyanyi :* ${anu.result.judul}\n*Dipublikasikan :* ${anu.result.dipublikasi}\n*Judul :*\n${anu.result.judul}\n\n*JOOX*\n*A F S* _BOT_`
					console.log(teks)
					console.log('----------------------------------------------')
					gambarlirik = await getBuffer(anu.result.thumb)
					console.log('gambar = ${anu.result.thumb}')
					client.sendMessage(from, gambarlirik, image, {quoted: mek, caption: teks})
					break
				case 'welcome':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isWelkom) return reply('Udah aktif um')
						welkom.push(from)
						fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
						reply('Sukses mengaktifkan fitur welcome di group ini ✔️')
					} else if (Number(args[0]) === 0) {
						welkom.splice(from, 1)
						fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
						reply('Sukses menonaktifkan fitur welcome di group ini ✔️')
					} else {
						reply('1 untuk mengaktifkan, 0 untuk menonaktifkan')
					}
				case 'clone':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Tag target yang ingin di clone')
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag cvk')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid[0]
					let { jid, id, notify } = groupMembers.find(x => x.jid === mentioned)
					try {
						pp = await client.getProfilePicture(id)
						buffer = await getBuffer(pp)
						client.updateProfilePicture(botNumber, buffer)
						mentions(`Foto profile Berhasil di perbarui menggunakan foto profile @${id.split('@')[0]}`, [jid], true)
					} catch (e) {
						reply('Gagal om')
					}
					break
				case 'wait':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						reply(mess.wait)
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						media = await client.downloadMediaMessage(encmedia)
						await wait(media).then(res => {
							client.sendMessage(from, res.video, video, {quoted: mek, caption: res.teks.trim()})
						}).catch(err => {
							reply(err)
						})
					} else {
						reply('Foto aja ngab')
					}
					break
				default:
					if (isGroup && isSimi && budy != undefined) {
						console.log(budy)
						muehe = await simih(budy)
						console.log(muehe)
						reply(muehe)
					} else {
						console.log(color('[ERROR]','red'), 'Unregistered Command from', color(sender.split('@')[0]))
					}
                           }
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}
starts()
