// const { Sequelize } = require('sequelize')
const Sequelize = require('sequelize')
require('dotenv').config()
const {CONNECTION_STRING} = process.env

const sequelize = new Sequelize(CONNECTION_STRING,{
    dialect: 'postgres',
    dialectOptions:{
        ssl:{
            rejectUnauthorized:false
        }
    }
 })
module.exports = {
    seed: (req, res) => {
        sequelize.query(`
            DROP TABLE IF EXISTS weapons;
            DROP TABLE IF EXISTS fighters;

            CREATE TABLE fighters(
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                power INT NOT NULL,
                hp INT NOT NULL,
                type VARCHAR NOT NULL
            );

            CREATE TABLE weapons (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                power INT NOT NULL,
                owner_id INT REFERENCES fighters(id)
            )
        `)
        .then(() => {
            console.log('DB seeded!')
            res.sendStatus(200)
        })
        .catch((err) => {
            console.log('you had a Sequelize error in your seed function:')
            console.log(err)
            res.status(500).send(err)
        })
    },
    createFighter:(req, res) => {
        const {name, hp, power,type} = req.body
        // name: fname.value,
        // power: fpower.value,
        // hp: fhp.value,   FROM THE BODY
        // type: ftype.value
        sequelize.query(`
            INSERT INTO fighters(name, hp, power,  type) 
            VALUES ('${name}',${power},${hp},'${type}')
            RETURNING * ;
            `
             )
             .then(dbRes => res.status(200).send(dbRes[0]))
             .catch(err => {
                console.log('theres an error in creatFighter',err)
                res.status(500).send(err)
             })
            },
        getFightersList:(req, res) => {
            sequelize.query(`
                SELECT id, name 
                FROM fighters
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => {
                console.log('theres an error in getFightersList',err.message)
                res.status(500).send(err)
             })
        },
        createWeapon: (req, res) => {
            const {power, name, owner} = req.body
            sequelize.query(`
            INSERT INTO weapons(name, power, owner_id) 
            VALUES('${name}',${power},${owner})
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => {
                console.log('theres an error in createWeapon',err.message)
                res.status(500).send(err)
             })
        },
        getFightersWeapons:(req, res) => {
            sequelize.query(`
            SELECT fighters.id AS fighter_id,
                   fighters.name AS fighter_name,
                   fighters.power AS fighter_power,
                   fighters.hp,
                   fighters.type,
                   weapons.id AS weapon_id,
                   weapons.name AS weapon,
                   weapons.power AS weapon_power
            FROM fighters
            JOIN weapons
            ON weapons.owner_id = fighters.id;
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => {
                console.log('theres an error in getFightersWeapons',err.message)
                res.status(500).send(err)
             })
        },
        deleteWeapon:(req, res) => {
            const {id,name} = req.params
            sequelize.query(`
            DELETE
            FROM weapons
            WHERE id = ${id}
            `)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => {
                console.log('theres an error in deleteWeapon',err.message)
                res.status(500).send(err)
             })
        }
}